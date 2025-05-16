import { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { has, isArray } from "lodash";
import axios from "axios";

import { toast } from "react-toastify";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { SocketContext } from "../../context/Socket/SocketContext";
import moment from "moment";

const useAuth = () => {
  const history = useHistory();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Variável para controlar se já existe um refresh em andamento
  let isRefreshing = false;
  // Array para armazenar as requisições que foram realizadas durante o refresh
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const parsedToken = JSON.parse(token);
          config.headers["Authorization"] = `Bearer ${parsedToken}`;
          setIsAuth(true);
        } catch (error) {
          console.error("Erro ao processar token:", error);
          localStorage.removeItem("token");
          setIsAuth(false);
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      
      // Se for uma requisição de logout, não faz nada
      if (originalRequest?.url === "/auth/logout") {
        return Promise.reject(error);
      }

      // Verifica se o erro é de autenticação e se não é uma tentativa de retry
      if ((error?.response?.status === 403 || error?.response?.status === 401) && !originalRequest?._retry) {
        if (originalRequest) {
          originalRequest._retry = true;
        }
        console.log("Token expirado ou inválido. Tentando refresh...");

        // Se já existe um refresh em andamento, coloca a requisição na fila
        if (isRefreshing) {
          try {
            const token = await new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            });
            console.log("Novo token obtido da fila. Repetindo requisição.");
            if (originalRequest) {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              return api(originalRequest);
            }
          } catch (err) {
            console.error("Erro ao obter token da fila:", err);
            return Promise.reject(err);
          }
        }

        isRefreshing = true;

        try {
          const { data } = await api.post("/auth/refresh_token");
          if (data) {
            console.log("Novo token obtido com sucesso");
            localStorage.setItem("token", JSON.stringify(data.token));
            api.defaults.headers.Authorization = `Bearer ${data.token}`;
            
            // Atualiza o usuário se houver mudanças
            if (data.user) {
              setUser(data.user);
            }

            // Atualiza a requisição original com o novo token
            if (originalRequest) {
              originalRequest.headers["Authorization"] = `Bearer ${data.token}`;
            }
            
            // Processa a fila de requisições pendentes
            processQueue(null, data.token);
            
            return originalRequest ? api(originalRequest) : Promise.reject(error);
          }
        } catch (refreshError) {
          console.error("Erro ao obter novo token:", refreshError);
          
          // Notifica as requisições pendentes sobre o erro
          processQueue(refreshError, null);
          
          // Se o refresh falhar, desloga o usuário
          localStorage.removeItem("token");
          localStorage.removeItem("companyId");
          localStorage.removeItem("userId");
          api.defaults.headers.Authorization = undefined;
          setIsAuth(false);
          
          // Redireciona para login apenas se não estiver na tela de login
          if (window.location.pathname !== "/login") {
            toast.error(i18n.t("auth.toasts.session"));
            history.push("/login");
          }
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
      
      if (error?.response?.status === 401 && !isLoggingOut) {
        localStorage.removeItem("token");
        localStorage.removeItem("companyId");
        localStorage.removeItem("userId");
        api.defaults.headers.Authorization = undefined;
        setIsAuth(false);
        
        // Redireciona para login apenas se não estiver na tela de login
        if (window.location.pathname !== "/login") {
          toast.error(i18n.t("auth.toasts.session"));
          history.push("/login");
        }
      }
      return Promise.reject(error);
    }
  );

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    const token = localStorage.getItem("token");
    (async () => {
      if (token) {
        try {
          console.log("Tentando refresh de token na inicialização...");
          const { data } = await api.post("/auth/refresh_token", {}, {
            // Garantir que cookies são enviados
            withCredentials: true
          });
          
          // Verifica se temos um token válido na resposta
          if (data && data.token) {
            api.defaults.headers.Authorization = `Bearer ${data.token}`;
            localStorage.setItem("token", JSON.stringify(data.token));
            setIsAuth(true);
            setUser(data.user);
            console.log("Refresh de token bem-sucedido!");
          } else {
            throw new Error("Refresh token inválido ou expirado");
          }
        } catch (err) {
          console.error("Erro ao fazer refresh do token:", err);
          // Tenta novamente uma vez em caso de erro de conexão, após pequena espera
          if (err.message && (err.message.includes('network') || err.message.includes('conexão'))) {
            try {
              await new Promise(resolve => setTimeout(resolve, 2000));
              const { data } = await api.post("/auth/refresh_token", {}, {
                withCredentials: true
              });
              if (data && data.token) {
                api.defaults.headers.Authorization = `Bearer ${data.token}`;
                localStorage.setItem("token", JSON.stringify(data.token));
                setIsAuth(true);
                setUser(data.user);
                console.log("Refresh de token bem-sucedido na segunda tentativa!");
                setLoading(false);
                return;
              }
            } catch (retryErr) {
              console.error("Falha na segunda tentativa de refresh do token:", retryErr);
            }
          }
          
          // Se falhar, limpa o token e força login
          localStorage.removeItem("token");
          localStorage.removeItem("companyId");
          localStorage.removeItem("userId");
          if (window.location.pathname !== "/login") {
            history.push("/login");
          }
        }
      }
      setLoading(false);
    })();
  }, [history]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    if (companyId && user.id) {
      const socket = socketManager.getSocket(companyId);

      socket.on(`company-${companyId}-user`, (data) => {
        if (data.action === "update" && data.user.id === user.id) {
          setUser(data.user);
        }
      });
    
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [socketManager, user]);

  const handleLogin = async (userData) => {
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", userData);
      const {
        user: { companyId, id, company },
      } = data;

      if (has(company, "settings") && isArray(company.settings)) {
        const setting = company.settings.find(
          (s) => s.key === "campaignsEnabled"
        );
        if (setting && setting.value === "true") {
          localStorage.setItem("cshow", null); //regra pra exibir campanhas
        }
      }

      moment.locale('pt-br');
      const dueDate = data.user.company.dueDate;
      const hoje = moment(moment()).format("DD/MM/yyyy");
      const vencimento = moment(dueDate).format("DD/MM/yyyy");

      var diff = moment(dueDate).diff(moment(moment()).format());

      var before = moment(moment().format()).isBefore(dueDate);
      var dias = moment.duration(diff).asDays();

      if (before === true) {
        localStorage.setItem("token", JSON.stringify(data.token));
        localStorage.setItem("companyId", companyId);
        localStorage.setItem("userId", id);
        localStorage.setItem("companyDueDate", vencimento);
        api.defaults.headers.Authorization = `Bearer ${data.token}`;
        setUser(data.user);
        setIsAuth(true);
        toast.success(i18n.t("auth.toasts.success"));
        if (Math.round(dias) < 5) {
          toast.warn(`Sua assinatura vence em ${Math.round(dias)} ${Math.round(dias) === 1 ? 'dia' : 'dias'} `);
        }
        history.push("/tickets");
        setLoading(false);
      } else {
        toastError(`Opss! Sua assinatura venceu ${vencimento}.
Entre em contato com o Suporte para mais informações! `);
        setLoading(false);
      }

      //quebra linha 
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setIsLoggingOut(true);

    try {
      console.log("Iniciando processo de logout");

      // Captura os IDs antes de limpar o localStorage
      const companyId = localStorage.getItem("companyId");
      const userId = localStorage.getItem("userId");

      // Desconecta explicitamente todos os sockets antes de qualquer coisa
      // Isso ajuda a prevenir tentativas de atualização de componentes durante o desmonte
      if (socketManager && companyId) {
        try {
          console.log("Desconectando sockets antes do logout");
          const socket = socketManager.getSocket(companyId);
          if (socket) {
            socket.disconnect();
          }
          
          // Forçar reset dos sockets no manager
          if (socketManager.currentSocket) {
            socketManager.currentSocket.removeAllListeners();
            socketManager.currentSocket.disconnect();
            socketManager.currentSocket = null;
            socketManager.currentCompanyId = null;
            socketManager.currentUserId = null;
          }
        } catch (socketError) {
          console.error("Erro ao desconectar sockets:", socketError);
        }
      }

      // Desativa todos os interceptors para prevenir requisições após logout
      const requestInterceptorId = api.interceptors.request.handlers.length > 0 ? 
        api.interceptors.request.handlers[0].id : null;
      const responseInterceptorId = api.interceptors.response.handlers.length > 0 ? 
        api.interceptors.response.handlers[0].id : null;
        
      if (requestInterceptorId !== null) {
        try {
          api.interceptors.request.eject(requestInterceptorId);
        } catch (e) {
          console.error("Erro ao remover interceptor de requisição:", e);
        }
      }
      
      if (responseInterceptorId !== null) {
        try {
          api.interceptors.response.eject(responseInterceptorId);
        } catch (e) {
          console.error("Erro ao remover interceptor de resposta:", e);
        }
      }
      
      // Obtém o token atual para garantir autenticação no logout
      const token = localStorage.getItem("token");
      
      // Limpa dados locais ANTES de tentar fazer logout no servidor
      // Isso previne requisições pendentes após o logout
      console.log("Limpando dados de sessão locais");
      setIsAuth(false);
      setUser({});
      localStorage.removeItem("token");
      localStorage.removeItem("companyId");
      localStorage.removeItem("userId");
      localStorage.removeItem("cshow");
      api.defaults.headers.Authorization = undefined;

      // Agora fazemos a tentativa de logout no servidor, 
      // mas não dependemos do sucesso para limpar o frontend
      if (token) {
        try {
          console.log("Tentando fazer logout no servidor");
          
          // Usando axios.create ao invés de api.create
          const logoutApi = axios.create({
            baseURL: process.env.REACT_APP_BACKEND_URL,
            withCredentials: true
          });
          
          // Define o token manualmente para esta requisição específica
          const parsedToken = JSON.parse(token);
          const config = {
            headers: { Authorization: `Bearer ${parsedToken}` },
            withCredentials: true
          };
          
          await logoutApi.delete("/auth/logout", config);
          
          console.log("Logout no servidor realizado com sucesso");
        } catch (serverError) {
          // Registra o erro para diagnóstico, mas não afeta o processo local de logout
          console.error("Erro ao fazer logout no servidor:", serverError.message);
          if (serverError.response) {
            console.error("Detalhes do erro:", {
              status: serverError.response.status,
              data: serverError.response.data
            });
          }
        }
      } else {
        console.warn("Nenhum token encontrado para logout");
      }
      
      console.log("Redirecionando para página de login");
      
      // Certifique-se de que o estado loading está definido como false antes de navegar
      setLoading(false);
      
      // Redirecionamos imediatamente para evitar qualquer possibilidade
      // de atualização de componentes que serão desmontados
      history.push("/login");
    } catch (err) {
      console.error("Erro geral no processo de logout:", err);
      toastError(err);
      setLoading(false);
      // Mesmo com erro, tentamos redirecionar para a página de login
      history.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getCurrentUserInfo = async () => {
    try {
      const { data } = await api.get("/auth/me");
      return data;
    } catch (err) {
      toastError(err);
    }
  };

  return {
    isAuth,
    user,
    loading,
    handleLogin,
    handleLogout,
    getCurrentUserInfo,
  };
};

export default useAuth;
