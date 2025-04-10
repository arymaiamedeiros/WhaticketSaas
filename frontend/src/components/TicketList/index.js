import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

const TicketList = () => {
  const navigate = useNavigate();

  const handleUpdateTicketStatus = async (e, status, userId) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${ticket.id}`, {
        status: status,
        userId: userId || null,
      });

      setLoading(false);
      if (status === "open") {
        navigate(`/tickets/${ticket.id}`);
      } else {
        navigate("/tickets");
      }
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };
}; 