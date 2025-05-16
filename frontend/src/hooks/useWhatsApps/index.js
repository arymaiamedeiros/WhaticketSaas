import { useState, useEffect, useReducer, useContext, useRef } from "react";
import toastError from "../../errors/toastError";

import api from "../../services/api";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_WHATSAPPS") {
    const whatsApps = action.payload;

    return [...whatsApps];
  }

  if (action.type === "UPDATE_WHATSAPPS") {
    const whatsApp = action.payload;
    const whatsAppIndex = state.findIndex((s) => s.id === whatsApp.id);

    if (whatsAppIndex !== -1) {
      state[whatsAppIndex] = whatsApp;
      return [...state];
    } else {
      return [whatsApp, ...state];
    }
  }

  if (action.type === "UPDATE_SESSION") {
    const whatsApp = action.payload;
    const whatsAppIndex = state.findIndex((s) => s.id === whatsApp.id);

    if (whatsAppIndex !== -1) {
      state[whatsAppIndex].status = whatsApp.status;
      state[whatsAppIndex].updatedAt = whatsApp.updatedAt;
      state[whatsAppIndex].qrcode = whatsApp.qrcode;
      state[whatsAppIndex].retries = whatsApp.retries;
      return [...state];
    } else {
      return [...state];
    }
  }

  if (action.type === "DELETE_WHATSAPPS") {
    const whatsAppId = action.payload;

    const whatsAppIndex = state.findIndex((s) => s.id === whatsAppId);
    if (whatsAppIndex !== -1) {
      state.splice(whatsAppIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useWhatsApps = () => {
  const [whatsApps, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);
  const { isAuth } = useContext(AuthContext);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    setLoading(true);
    const fetchSession = async () => {
      try {
        if (!isAuth || !isMountedRef.current) {
          console.log("Requisição de WhatsApp ignorada - usuário deslogado ou componente desmontado");
          return;
        }
        
        const { data } = await api.get("/whatsapp/?session=0");
        
        if (isMountedRef.current) {
          dispatch({ type: "LOAD_WHATSAPPS", payload: data });
          setLoading(false);
        }
      } catch (err) {
        if (err.response && (err.response.status === 403 || err.response.status === 401)) {
          console.log("Erro de autenticação ao carregar sessões de WhatsApp - ignorando");
          if (isMountedRef.current) {
            setLoading(false);
          }
          return;
        }
        
        if (isMountedRef.current) {
          setLoading(false);
          toastError(err);
        }
      }
    };
    fetchSession();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [isAuth]);

  useEffect(() => {
    if (!isAuth) return;
    
    const companyId = localStorage.getItem("companyId");
    if (!companyId) return;
    
    const socket = socketManager.getSocket(companyId);
    if (!socket) return;

    socket.on(`company-${companyId}-whatsapp`, (data) => {
      if (!isMountedRef.current) return;
      
      if (data.action === "update") {
        dispatch({ type: "UPDATE_WHATSAPPS", payload: data.whatsapp });
      }
    });

    socket.on(`company-${companyId}-whatsapp`, (data) => {
      if (!isMountedRef.current) return;
      
      if (data.action === "delete") {
        dispatch({ type: "DELETE_WHATSAPPS", payload: data.whatsappId });
      }
    });

    socket.on(`company-${companyId}-whatsappSession`, (data) => {
      if (!isMountedRef.current) return;
      
      if (data.action === "update") {
        dispatch({ type: "UPDATE_SESSION", payload: data.session });
      }
    });

    return () => {
      if (socket && socket.connected) {
        socket.disconnect();
      }
    };
  }, [socketManager, isAuth]);

  return { whatsApps, loading };
};

export default useWhatsApps;
