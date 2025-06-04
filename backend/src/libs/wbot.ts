import * as Sentry from "@sentry/node";
import makeWASocket, {
  WASocket,
  Browsers,
  WAMessage,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  makeInMemoryStore,
  isJidBroadcast,
  WAMessageKey,
  jidNormalizedUser,
  CacheStore,
  proto
} from "@whiskeysockets/baileys";
import { Op } from "sequelize";
import { FindOptions } from "sequelize/types";
import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";
import MAIN_LOGGER from "@whiskeysockets/baileys/lib/Utils/logger";
import authState from "../helpers/authState";
import { Boom } from "@hapi/boom";
import AppError from "../errors/AppError";
import { getIO } from "./socket";
import { Store } from "./store";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import DeleteBaileysService from "../services/BaileysServices/DeleteBaileysService";
import NodeCache from 'node-cache';
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
const loggerBaileys = MAIN_LOGGER.child({});
loggerBaileys.level = "error";

const msgRetryCounterCache = new NodeCache({
  stdTTL: 600,
  maxKeys: 1000,
  checkperiod: 300,
  useClones: false
});

const msgCache = new NodeCache({
  stdTTL: 60,
  maxKeys: 1000,
  checkperiod: 300,
  useClones: false
});

type Session = WASocket & {
  id?: number;
  store?: Store;
};

// Map to control QR code generation retries
const retriesQrCodeMap = new Map<number, number>();
const connectingTimeoutMap = new Map<number, NodeJS.Timeout>();

// Message store for cache
const msgDB = (function() {
  const data = new Map<string, proto.IWebMessageInfo>()
  const getKey = (key: proto.IMessageKey) => key.remoteJid + '|' + key.id

  const get = async (key: proto.IMessageKey): Promise<proto.IMessage | undefined> => {
    const cacheKey = getKey(key);
    if (msgCache.has(cacheKey)) {
      return msgCache.get(cacheKey) as proto.IMessage;
    }
    return data.get(getKey(key)) as proto.IMessage;
  };

  return { get };
})();

// Array to store all active sessions
const sessions: Session[] = [];

export const getWbot = (whatsappId: number): Session => {
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);

  if (sessionIndex === -1) {
    throw new AppError("ERR_WAPP_NOT_INITIALIZED");
  }
  return sessions[sessionIndex];
};

export const removeWbot = async (
  whatsappId: number,
  isLogout = true
): Promise<void> => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
    if (sessionIndex !== -1) {
      if (isLogout) {
        sessions[sessionIndex].logout();
        sessions[sessionIndex].ws.close();
      }

      sessions.splice(sessionIndex, 1);
    }
  } catch (err) {
    logger.error(err);
  }
};

export const restartWbot = async (
  companyId: number,
  session?: any
): Promise<void> => {
  try {
    const options: FindOptions = {
      where: {
        companyId,
      },
      attributes: ["id"],
    }

    const whatsapp = await Whatsapp.findAll(options);

    // Limpar timeouts pendentes para evitar conflitos
    whatsapp.map(async c => {
      if (connectingTimeoutMap.has(c.id)) {
        clearTimeout(connectingTimeoutMap.get(c.id));
        connectingTimeoutMap.delete(c.id);
      }
      
      retriesQrCodeMap.delete(c.id);
      
      const sessionIndex = sessions.findIndex(s => s.id === c.id);
      if (sessionIndex !== -1) {
        try {
          // Fechar a conexão websocket atual
          sessions[sessionIndex].ws.close();
          logger.info(`Socket ${c.id} closed for restart`);
        } catch (err) {
          logger.error(`Error closing socket ${c.id}: ${err}`);
        }
      }
    });

  } catch (err) {
    logger.error(err);
  }
};

export const initWASocket = async (whatsapp: Whatsapp): Promise<Session> => {
  return new Promise(async (resolve, reject) => {
    try {
      (async () => {
        const io = getIO();

        const whatsappUpdate = await Whatsapp.findOne({
          where: { id: whatsapp.id }
        });

        if (!whatsappUpdate) return;

        const { id, name, provider } = whatsappUpdate;

        // Limpar qualquer timeout existente para este ID
        if (connectingTimeoutMap.has(id)) {
          clearTimeout(connectingTimeoutMap.get(id));
          connectingTimeoutMap.delete(id);
        }

        // Configurar um timeout de segurança para evitar ficar preso em CONNECTING
        const connectingTimeout = setTimeout(async () => {
          logger.warn(`Connection timeout for WhatsApp ${name}. Forcing reconnection.`);
          try {
            const whatsappToUpdate = await Whatsapp.findByPk(id);
            if (whatsappToUpdate) {
              await whatsappToUpdate.update({ 
                status: "DISCONNECTED", 
                qrcode: "",
                retries: (whatsappToUpdate.retries || 0) + 1
              });
              
              io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                action: "update",
                session: whatsappToUpdate
              });
              
              // Remove da lista de sessões ativas
              const sessionIndex = sessions.findIndex(s => s.id === id);
              if (sessionIndex !== -1) {
                try {
                  sessions[sessionIndex].ws.close();
                  sessions.splice(sessionIndex, 1);
                } catch (err) {
                  logger.error(`Error closing socket on timeout: ${err}`);
                }
              }
              
              // Reinicia a sessão após um breve delay
              setTimeout(() => {
                StartWhatsAppSession(whatsappToUpdate, whatsappToUpdate.companyId);
              }, 3000);
            }
          } catch (err) {
            logger.error(`Error handling connection timeout: ${err}`);
          }
        }, 60000); // 1 minuto timeout
        
        connectingTimeoutMap.set(id, connectingTimeout);

        const { version, isLatest } = await fetchLatestBaileysVersion();
        const isLegacy = provider === "stable" ? true : false;

        logger.info(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
        logger.info(`isLegacy: ${isLegacy}`);
        logger.info(`Starting session ${name}`);
        let retriesQrCode = 0;

        let wsocket: Session = null;
        const store = makeInMemoryStore({
          logger: loggerBaileys
        });

        const { state, saveState } = await authState(whatsapp);

        //const msgRetryCounterCache = new NodeCache();
        const userDevicesCache: CacheStore = new NodeCache();

        wsocket = makeWASocket({
          logger: loggerBaileys,
          printQRInTerminal: false,
          auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
          },
          version,
          browser: Browsers.appropriate("Desktop"),
          defaultQueryTimeoutMs: undefined,
          msgRetryCounterCache,
          markOnlineOnConnect: false,
          connectTimeoutMs: 25_000,
          retryRequestDelayMs: 500,
          getMessage: msgDB.get,
          emitOwnEvents: true,
          fireInitQueries: true,
          transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 3000 },
          shouldIgnoreJid: jid => isJidBroadcast(jid),
        });

        wsocket.ev.on(
          "connection.update",
          async ({ connection, lastDisconnect, qr }) => {
            logger.info(`Socket ${name} Connection Update ${connection || ""} ${lastDisconnect ? JSON.stringify(lastDisconnect) : ""}`);

            // Se temos uma atualização de conexão, limpamos o timeout
            if (connectingTimeoutMap.has(id)) {
              clearTimeout(connectingTimeoutMap.get(id));
              connectingTimeoutMap.delete(id);
            }

            const disconect = (lastDisconnect?.error as Boom)?.output?.statusCode;

            if (connection === "close") {
              if (disconect === 403) {
                await whatsapp.update({ status: "PENDING", session: "", number: "" });
                removeWbot(id, false);

                await DeleteBaileysService(whatsapp.id);

                io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                  action: "update",
                  session: whatsapp
                });
              }

              if (disconect !== DisconnectReason.loggedOut) {
                removeWbot(id, false);
                setTimeout(() => StartWhatsAppSession(whatsapp, whatsapp.companyId), 2000);
              } else {
                await whatsapp.update({ status: "PENDING", session: "", number: "" });
                await DeleteBaileysService(whatsapp.id);

                io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                  action: "update",
                  session: whatsapp
                });
                removeWbot(id, false);
                setTimeout(() => StartWhatsAppSession(whatsapp, whatsapp.companyId), 2000);
              }
            }

            if (connection === "open") {
              await whatsapp.update({
                status: "CONNECTED",
                qrcode: "",
                retries: 0,
                number:
                  wsocket.type === "md"
                    ? jidNormalizedUser((wsocket as WASocket).user.id).split("@")[0]
                    : "-"
              });

                io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                  action: "update",
                  session: whatsapp
                });

              const sessionIndex = sessions.findIndex(
                s => s.id === whatsapp.id
              );
              if (sessionIndex === -1) {
                wsocket.id = whatsapp.id;
                sessions.push(wsocket);
              }

              resolve(wsocket);
            }

            if (qr !== undefined) {
              if (retriesQrCodeMap.get(id) && retriesQrCodeMap.get(id) >= 3) {
                await whatsapp.update({
                  status: "DISCONNECTED",
                  qrcode: ""
                });
                await DeleteBaileysService(whatsapp.id);

                io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                  action: "update",
                  session: whatsapp
                });
                
                try {
                  wsocket.ev.removeAllListeners("connection.update");
                  wsocket.ws.close();
                } catch (error) {
                  logger.error(`Error closing socket after max QR retries: ${error}`);
                }
                
                wsocket = null;
                retriesQrCodeMap.delete(id);
              } else {
                logger.info(`Session QRCode Generate ${name}`);
                retriesQrCodeMap.set(id, (retriesQrCode += 1));

                await whatsapp.update({
                  qrcode: qr,
                  status: "qrcode",
                  retries: 0,
                  number: ""
                });
                const sessionIndex = sessions.findIndex(
                  s => s.id === whatsapp.id
                );

                if (sessionIndex === -1) {
                  wsocket.id = whatsapp.id;
                  sessions.push(wsocket);
                }

                io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                  action: "update",
                  session: whatsapp
                });
              }
            }
          }
        );
        wsocket.ev.on("creds.update", saveState);

        wsocket.ev.on(
          "presence.update",
          async ({ id: remoteJid, presences }) => {
            try {
              logger.debug(
                { remoteJid, presences },
                "Received contact presence"
              );
              if (!presences[remoteJid]?.lastKnownPresence) {
                return;
              }
              const contact = await Contact.findOne({
                where: {
                  number: remoteJid.replace(/\D/g, ""),
                  companyId: whatsapp.companyId
                }
              });
              if (!contact) {
                return;
              }
              const ticket = await Ticket.findOne({
                where: {
                  contactId: contact.id,
                  whatsappId: whatsapp.id,
                  status: {
                    [Op.or]: ["open", "pending"]
                  }
                }
              });

              if (ticket) {
                io.to(ticket.id.toString())
                  .to(`company-${whatsapp.companyId}-${ticket.status}`)
                  .to(`queue-${ticket.queueId}-${ticket.status}`)
                  .emit(`company-${whatsapp.companyId}-presence`, {
                    ticketId: ticket.id,
                    presence: presences[remoteJid].lastKnownPresence
                  });
              }
            } catch (error) {
              logger.error(
                { remoteJid, presences },
                "presence.update: error processing"
              );
              if (error instanceof Error) {
                logger.error(`Error: ${error.name} ${error.message}`);
              } else {
                logger.error(`Error was object of type: ${typeof error}`);
              }
            }
          }
        );

        store.bind(wsocket.ev);
      })();
    } catch (error) {
      Sentry.captureException(error);
      console.log(error);
      reject(error);
    }
  });
};
