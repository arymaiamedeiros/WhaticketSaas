import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import Board from 'react-trello';
import { toast } from "react-toastify";
import LaneTitle from "../../components/Kanban/LaneTitle";
import CardTitle from "../../components/Kanban/CardTitle";
import DeleteButton from "../../components/Kanban/DeleteButton";
import FooterButtons from "../../components/Kanban/FooterButtons";
import "./responsive.css";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1),
    maxHeight: "calc(100vh - 48px)"
  }
}));

const Kanban = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const jsonString = user.queues.map(queue => queue.UserQueue.queueId);
  
  const [tags, setTags] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [laneQuantities, setLaneQuantities] = useState({});
  const [file, setFile] = useState({ lanes: [] });

  const fetchTags = async () => {
    try {
      const response = await api.get("/tags/kanban");
      const fetchedTags = response.data.lista || []; 
      setTags(fetchedTags);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTickets = async () => {
    try {
      const { data } = await api.get("/ticket/kanban", {
        params: {
          queueIds: JSON.stringify(jsonString),
          teste: true
        }
      });
      setTickets(data.tickets);
    } catch (err) {
      console.log(err);
      setTickets([]);
    }
  };

  useEffect(() => {
    fetchTags();
    fetchTickets();
  }, []);

  useEffect(() => {
    const newQuantities = {};

    newQuantities["0"] = tickets.filter(ticket => ticket.tags.length === 0).length;

    tags.forEach(tag => {
      const count = tickets.filter(ticket => ticket.tags.some(t => t.id === tag.id)).length;
      newQuantities[tag.id.toString()] = count;
    });

    setLaneQuantities(newQuantities);
  }, [tags, tickets]);

  useEffect(() => {
    const lanes = [
      {
        id: "0",
        title: "Em aberto",
        titleElement: <LaneTitle firstLane quantity={laneQuantities["0"]}>Em aberto</LaneTitle>,
        cards: tickets.filter(ticket => ticket.tags.length === 0).map(ticket => ({
          id: ticket.id.toString(),
          title: <CardTitle ticket={ticket} userProfile={user.profile} />,
          label: <DeleteButton setTickets={setTickets} ticket={ticket} userProfile={user.profile} />,
          description: <FooterButtons ticket={ticket} />,

          draggable: true,
          href: "/tickets/" + ticket.uuid,
        })),
      },
      ...tags.map(tag => ({
        id: tag.id.toString(),
        title: tag.name,
        titleElement: <LaneTitle squareColor={tag.color} quantity={laneQuantities[tag.id.toString()]}>{tag.name}</LaneTitle>,
        cards: tickets.filter(ticket => ticket.tags.some(t => t.id === tag.id)).map(ticket => ({
          id: ticket.id.toString(),
          title: <CardTitle ticket={ticket} userProfile={user.profile} />,
          label: <DeleteButton ticket={ticket} userProfile={user.profile} />,
          description: <FooterButtons ticket={ticket} />,
          draggable: true,
          href: "/tickets/" + ticket.uuid,
        })),
      })),
    ];

    setFile({ lanes });
  }, [tags, tickets, laneQuantities]);

  const handleCardMove = async (sourceLaneId, targetLaneId, cardId) => {
    try {
      await api.delete(`/ticket-tags/${cardId}`);
      if(targetLaneId !== "0") {
        await api.put(`/ticket-tags/${cardId}/${targetLaneId}`);
      }
      toast.success('Ticket movido com sucesso');
      
      fetchTickets();
      fetchTags();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={classes.root}>
      <Board 
        data={file} 
        onCardMoveAcrossLanes={handleCardMove}
        laneStyle={{maxHeight: "85vh"}}
        hideCardDeleteIcon
        style={{
          backgroundColor: 'rgba(252, 252, 252, 0.03)', 
          height: "calc(100vh - 48px)",
          fontFamily: "Inter",
        }}
        components={{
          LaneHeader: ({title, cards, titleElement}) => {
            // Usamos o elemento personalizado se estiver disponível, caso contrário, usamos o título normal
            return titleElement || title;
          }
        }}
      />
    </div>
  );
};

export default Kanban;
