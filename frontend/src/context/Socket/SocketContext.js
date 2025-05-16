import { createContext } from "react";
import openSocket from "socket.io-client";
import { isExpired, decodeToken } from "react-jwt";

// Constante para determinar se o ambiente é de desenvolvimento
const isDevelopment = process.env.NODE_ENV === "development";

// Função de logging personalizada que controla o nível de verbosidade
const socketLogger = {
  info: (message) => {
    console.log(`[Socket] ${message}`);
  },
  warn: (message) => {
    console.warn(`[Socket] ${message}`);
  },
  error: (message, error = null) => {
    console.error(`[Socket] ${message}`, error ? error : '');
  },
  debug: (message, data = null) => {
    if (isDevelopment) {
      // Em desenvolvimento, mostramos logs mais detalhados
      if (data) {
        console.debug(`[Socket Debug] ${message}`, typeof data === 'object' ? {...data} : data);
      } else {
        console.debug(`[Socket Debug] ${message}`);
      }
    }
  }
};

class ManagedSocket {
  constructor(socketManager) {
    this.socketManager = socketManager;
    this.rawSocket = socketManager.currentSocket;
    this.callbacks = [];
    this.joins = [];

    this.rawSocket.on("connect", () => {
      if (this.rawSocket.io.opts.query?.r && !this.rawSocket.recovered) {
        const refreshJoinsOnReady = () => {
          for (const j of this.joins) {
            socketLogger.debug(`Refreshing join: ${j.event}`);
            this.rawSocket.emit(`join${j.event}`, ...j.params);
          }
          this.rawSocket.off("ready", refreshJoinsOnReady);
        };
        for (const j of this.callbacks) {
          this.rawSocket.off(j.event, j.callback);
          this.rawSocket.on(j.event, j.callback);
        }
        
        this.rawSocket.on("ready", refreshJoinsOnReady);
      }
    });
  }
  
  on(event, callback) {
    if (event === "ready" || event === "connect") {
      return this.socketManager.onReady(callback);
    }
    this.callbacks.push({event, callback});
    return this.rawSocket.on(event, callback);
  }
  
  off(event, callback) {
    const i = this.callbacks.findIndex((c) => c.event === event && c.callback === callback);
    if (i !== -1) {
      this.callbacks.splice(i, 1);
    }
    return this.rawSocket.off(event, callback);
  }
  
  emit(event, ...params) {
    if (event.startsWith("join")) {
      const eventName = event.substring(4);
      this.joins.push({ event: eventName, params });
      socketLogger.debug(`Joining: ${eventName}`);
    }
    return this.rawSocket.emit(event, ...params);
  }
  
  disconnect() {
    for (const j of this.joins) {
      try {
        this.rawSocket.emit(`leave${j.event}`, ...j.params);
      } catch (error) {
        socketLogger.error(`Error leaving ${j.event}`, error);
      }
    }
    this.joins = [];
    
    for (const c of this.callbacks) {
      try {
        this.rawSocket.off(c.event, c.callback);
      } catch (error) {
        socketLogger.error(`Error removing listener for ${c.event}`, error);
      }
    }
    this.callbacks = [];
  }
}

class DummySocket {
  on() { return this; }
  off() { return this; }
  emit() { return this; }
  disconnect() { return this; }
}

const SocketManager = {
  currentCompanyId: -1,
  currentUserId: -1,
  currentSocket: null,
  socketReady: false,

  getSocket: function(companyId) {
    try {
      let userId = null;
      if (localStorage.getItem("userId")) {
        userId = localStorage.getItem("userId");
      }

      if (!companyId && !this.currentSocket) {
        return new DummySocket();
      }

      if (companyId && typeof companyId !== "string") {
        companyId = `${companyId}`;
      }

      if (companyId !== this.currentCompanyId || userId !== this.currentUserId) {
        if (this.currentSocket) {
          try {
            socketLogger.info("Fechando socket antigo - empresa ou usuário alterado");
            this.currentSocket.removeAllListeners();
            this.currentSocket.disconnect();
          } catch (disconnectError) {
            socketLogger.error("Erro ao desconectar socket antigo", disconnectError);
          } finally {
            this.currentSocket = null;
            this.currentCompanyId = null;
            this.currentUserId = null;
          }
        }

        let token = localStorage.getItem("token");
        if (!token) {
          return new DummySocket();
        }
        
        if (isExpired(token)) {
          try {
            const apiBase = process.env.REACT_APP_BACKEND_URL || "";
            fetch(`${apiBase}/auth/refresh_token`, {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              }
            })
            .then(response => {
              if (response.ok) return response.json();
              throw new Error('Falha ao renovar token');
            })
            .then(data => {
              if (data && data.token) {
                localStorage.setItem("token", JSON.stringify(data.token));
                window.location.reload();
              } else {
                socketLogger.warn("Token expirado e não foi possível renovar");
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                window.location.href = "/login";
              }
            })
            .catch(error => {
              socketLogger.error("Erro ao renovar token", error);
              localStorage.removeItem("token");
              localStorage.removeItem("userId");
              window.location.href = "/login";
            });
            return new DummySocket();
          } catch (error) {
            socketLogger.warn("Erro ao tentar renovar token expirado");
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            window.location.href = "/login";
            return new DummySocket();
          }
        }

        this.currentCompanyId = companyId;
        this.currentUserId = userId;
        
        let parsedToken;
        try {
          parsedToken = JSON.parse(token);
        } catch (error) {
          socketLogger.error("Erro ao analisar token", error);
          return new DummySocket();
        }
        
        this.currentSocket = openSocket(process.env.REACT_APP_BACKEND_URL, {
          transports: ["websocket"],
          pingTimeout: 18000,
          pingInterval: 18000,
          query: { token: parsedToken },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000
        });

        // Configura manipuladores de eventos padrão
        this.setupSocketEventHandlers(token);
      }
      
      return new ManagedSocket(this);
    } catch (error) {
      socketLogger.error("Erro no gerenciamento de socket", error);
      return new DummySocket();
    }
  },
  
  setupSocketEventHandlers: function(token) {
    if (!this.currentSocket) return;
    
    // Trata erros de socket
    this.currentSocket.io.on("error", (error) => {
      socketLogger.error("Erro de Socket.IO", error);
    });

    // Trata erros de conexão
    this.currentSocket.io.on("connect_error", (error) => {
      socketLogger.error(`Erro de conexão do socket: ${error.message}`);
      
      if (error.message.includes("CORS")) {
        socketLogger.warn("Erro de CORS detectado. Verifique se o backend está rodando e o CORS está configurado corretamente.");
      }
    });

    // Trata tentativas de reconexão
    this.currentSocket.io.on("reconnect_attempt", (attemptNumber) => {
      socketLogger.info(`Tentativa de reconexão #${attemptNumber}`);
      this.currentSocket.io.opts.query.r = 1;
      
      const currentToken = localStorage.getItem("token");
      if (!currentToken) {
        socketLogger.warn("Sem token disponível para reconexão");
        return;
      }
      
      if (isExpired(currentToken)) {
        socketLogger.warn("Token expirado, recarregando página");
        window.location.reload();
      } else {
        try {
          const newToken = JSON.parse(currentToken);
          socketLogger.debug("Usando novo token para reconexão");
          this.currentSocket.io.opts.query.token = newToken;
        } catch (error) {
          socketLogger.error("Erro ao analisar token na reconexão", error);
          window.location.reload();
        }
      }
    });
    
    // Trata desconexões
    this.currentSocket.on("disconnect", (reason) => {
      socketLogger.info(`Socket desconectado. Motivo: ${reason}`);
      
      if (reason.startsWith("io server disconnect")) {
        this.handleServerDisconnect(token);
      }
    });
    
    // Trata conexões bem-sucedidas
    this.currentSocket.on("connect", () => {
      socketLogger.info("Socket conectado com sucesso");
    });
    
    // Registra eventos em ambiente de desenvolvimento
    if (isDevelopment) {
      this.currentSocket.onAny((event, ...args) => {
        const eventData = {
          event,
          args: args.map(arg => 
            typeof arg === 'object' ? 'Object' : arg
          )
        };
        socketLogger.debug("Evento recebido", eventData);
      });
    }
    
    this.onReady(() => {
      this.socketReady = true;
      socketLogger.debug("Socket pronto para uso");
    });
  },
  
  handleServerDisconnect: function(token) {
    socketLogger.warn("Tentando reconectar após desconexão do servidor");
    
    if (!token) {
      socketLogger.warn("Sem token disponível para reconexão após desconexão");
      return;
    }
    
    if (isExpired(token)) {
      socketLogger.warn("Token expirado após desconexão, recarregando página");
      window.location.reload();
      return;
    }
    
    try {
      const newToken = JSON.parse(token);
      this.currentSocket.io.opts.query.token = newToken;
      this.currentSocket.io.opts.query.r = 1;
      this.currentSocket.connect();
      socketLogger.info("Reconexão iniciada após desconexão do servidor");
    } catch (error) {
      socketLogger.error("Erro ao analisar token após desconexão", error);
      window.location.reload();
    }
  },
  
  onReady: function(callbackReady) {
    if (this.socketReady) {
      callbackReady();
      return;
    }
    
    if (this.currentSocket) {
      this.currentSocket.once("ready", () => {
        callbackReady();
      });
    }
  },
  
  onConnect: function(callbackReady) { 
    this.onReady(callbackReady);
  }
};

const SocketContext = createContext();

export { SocketContext, SocketManager };
