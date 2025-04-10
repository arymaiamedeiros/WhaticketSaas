import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";

const TicketDetail = () => {
  const navigate = useNavigate();

  const handleBackToTickets = () => {
    setLoading(true);
    try {
      navigate("/tickets");
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };
}; 