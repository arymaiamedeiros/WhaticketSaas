import { WAMessage } from "@whiskeysockets/baileys";
import WALegacySocket from "@whiskeysockets/baileys";
import * as Sentry from "@sentry/node";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import SendWhatsAppMessage from "./SendWhatsAppMessage";
import formatBody from "../../helpers/Mustache";
import {getBodyMessage} from "./wbotMessageListener";
import CreateMessageService from "../MessageServices/CreateMessageService";

interface ReactionRequest {
  messageId: string;
  ticket: Ticket;
  reactionType: string; // Exemplo: 'like', 'heart', etc.
}

const SendWhatsAppReaction = async ({
  messageId,
  ticket,
  reactionType
}: ReactionRequest): Promise<WAMessage> => {
  const wbot = await GetTicketWbot(ticket);

  const number = `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;

  try {
    const messageToReact = await Message.findOne({
      where: {
        id: messageId
      }
    });

    if (!messageToReact) {
      throw new AppError("Message not found");
    }

    if (!reactionType) {
      throw new AppError("ReactionType not found");
    }

    const msgFound = JSON.parse(messageToReact.dataJson);

    console.log(reactionType);

    const msg = await wbot.sendMessage(number, {
      react: {
        text: reactionType, // O tipo de reação
        key: msgFound.key // A chave da mensagem original a qual a reação se refere
      }

    });


    return msg;
  } catch (err) {
    Sentry.captureException(err);
    console.log(err);
    throw new AppError("ERR_SENDING_WAPP_REACTION");
  }
};

export default SendWhatsAppReaction;
