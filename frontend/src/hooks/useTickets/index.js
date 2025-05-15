import { useEffect, useState } from "react";
import toastError from "../../errors/toastError";

import api from "../../services/api";

const useTickets = ({
  searchParam,
  tags,
  users,
  pageNumber,
  status,
  date,
  updatedAt,
  showAll,
  queueIds,
  withUnreadMessages,
}) => {
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchTickets = async () => {
        try {
          console.log("Buscando tickets com parâmetros:", {
            searchParam,
            pageNumber,
            status,
            showAll,
            queueIds
          });
          
          const { data } = await api.get("/tickets", {
            params: {
              searchParam,
              pageNumber,
              tags,
              users,
              status,
              date,
              updatedAt,
              showAll,
              queueIds,
              withUnreadMessages,
            },
          });
          
          console.log("Tickets recebidos:", data.tickets.length);
          setTickets(data.tickets);
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          console.error("Erro ao buscar tickets:", err);
          setLoading(false);
          toastError(err);
          
          // Verifica se o erro é de autenticação
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            console.log("Erro de autenticação. Token atual:", localStorage.getItem("token"));
          }
        }
      };
      fetchTickets();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [
    searchParam,
    tags,
    users,
    pageNumber,
    status,
    date,
    updatedAt,
    showAll,
    queueIds,
    withUnreadMessages,
  ]);

  return { tickets, loading, hasMore };
};

export default useTickets;
