import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";
import { styled } from '@mui/material/styles';
import { green, grey, red, blue } from '@mui/material/colors';
import {
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Typography,
  Avatar,
  Divider,
  Badge,
  Box,
  Tooltip
} from "@mui/material";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MarkdownWrapper from "../MarkdownWrapper";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import toastError from "../../errors/toastError";
import { v4 as uuidv4 } from "uuid";
import {
  Room as RoomIcon,
  WhatsApp as WhatsAppIcon,
  Android as AndroidIcon,
  Visibility as VisibilityIcon,
  Done as DoneIcon,
  ClearOutlined as ClearOutlinedIcon
} from "@mui/icons-material";
import TicketMessagesDialog from "../TicketMessagesDialog";
import contrastColor from "../../helpers/contrastColor";
import ContactTag from "../ContactTag";

const TicketContainer = styled(ListItem)(({ theme }) => ({
  position: "relative",
}));

const PendingTicket = styled(TicketContainer)({
  cursor: "unset",
});

const QueueTag = styled(Box)({
  background: "#FCFCFC",
  color: "#000",
  marginRight: 1,
  padding: 1,
  fontWeight: 'bold',
  paddingLeft: 5,
  paddingRight: 5,
  borderRadius: 3,
  fontSize: "0.8em",
  whiteSpace: "nowrap"
});

const NoTicketsDiv = styled(Box)({
  display: "flex",
  height: "100px",
  margin: 40,
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
});

const NewMessagesCount = styled(Badge)({
  position: "absolute",
  alignSelf: "center",
  marginRight: 8,
  marginLeft: "auto",
  top: "10px",
  left: "20px",
  borderRadius: 0,
});

const NoTicketsText = styled(Typography)({
  textAlign: "center",
  color: "rgb(104, 121, 146)",
  fontSize: "14px",
  lineHeight: "1.4",
});

const ConnectionTag = styled(Box)({
  background: "green",
  color: "#FFF",
  marginRight: 1,
  padding: 1,
  fontWeight: 'bold',
  paddingLeft: 5,
  paddingRight: 5,
  borderRadius: 3,
  fontSize: "0.8em",
  whiteSpace: "nowrap"
});

const NoTicketsTitle = styled(Typography)({
  textAlign: "center",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0px",
});

const ContactNameWrapper = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  marginLeft: "5px",
});

const LastMessageTime = styled(Box)({
  justifySelf: "flex-end",
  textAlign: "right",
  position: "relative",
  top: -21
});

const ClosedBadge = styled(Box)({
  alignSelf: "center",
  justifySelf: "flex-end",
  marginRight: 32,
  marginLeft: "auto",
});

const ContactLastMessage = styled(Box)({
  paddingRight: "0%",
  marginLeft: "5px",
});

const BadgeStyle = styled(Badge)(({ theme }) => ({
  color: "white",
  backgroundColor: green[500],
}));

const AcceptButton = styled(ButtonWithSpinner)({
  position: "absolute",
  left: "50%",
});

const TicketQueueColor = styled(Box)({
  flex: "none",
  width: "8px",
  height: "100%",
  position: "absolute",
  top: "0%",
  left: "0%",
});

const TicketInfo = styled(Box)({
  position: "relative",
  top: -13
});

const SecondaryContentSecond = styled(Box)({
  display: 'flex',
  alignItems: "flex-start",
  flexWrap: "wrap",
  flexDirection: "row",
  alignContent: "flex-start",
});

const TicketInfo1 = styled(Box)({
  position: "relative",
  top: 13,
  right: 0
});

const RadiusDot = styled(Badge)({
  "& .MuiBadge-badge": {
    borderRadius: 2,
    position: "inherit",
    height: 16,
    margin: 2,
    padding: 3
  },
  "& .MuiBadge-anchorOriginTopRightRectangle": {
    transform: "scale(1) translate(0%, -40%)",
  },
});

const TicketListItemCustom = ({ ticket }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ticketUser, setTicketUser] = useState(null);
  const [ticketQueueName, setTicketQueueName] = useState(null);
  const [ticketQueueColor, setTicketQueueColor] = useState(null);
  const [tag, setTag] = useState([]);
  const [whatsAppName, setWhatsAppName] = useState(null);
  const [openTicketMessageDialog, setOpenTicketMessageDialog] = useState(false);
  const { ticketId } = useParams();
  const isMounted = useRef(true);
  const { setCurrentTicket } = useContext(TicketsContext);
  const { user } = useContext(AuthContext);
  const { profile } = user;

  useEffect(() => {
    if (ticket.userId && ticket.user) {
      setTicketUser(ticket.user?.name?.toUpperCase());
    }
    setTicketQueueName(ticket.queue?.name?.toUpperCase());
    setTicketQueueColor(ticket.queue?.color);

    if (ticket.whatsappId && ticket.whatsapp) {
      setWhatsAppName(ticket.whatsapp.name?.toUpperCase());
    }

    setTag(ticket?.tags);

    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleCloseTicket = async (id) => {
    setTag(ticket?.tags);
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "closed",
        userId: user?.id,
        queueId: ticket?.queue?.id,
        useIntegration: false,
        promptId: null,
        integrationId: null
      });
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    navigate("/tickets/");
  };

  const handleReopenTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "open",
        userId: user?.id,
        queueId: ticket?.queue?.id,
        useIntegration: false,
        promptId: null,
        integrationId: null
      });
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    navigate("/tickets/");
  };

  const handleAcepptTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "open",
        userId: user?.id,
        queueId: ticket?.queue?.id,
        useIntegration: false,
        promptId: null,
        integrationId: null
      });
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    navigate("/tickets/");
  };

  const handleSendMessage = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "open",
        userId: user?.id,
        queueId: ticket?.queue?.id,
        useIntegration: false,
        promptId: null,
        integrationId: null
      });
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    navigate("/tickets/");
  };

  const handleSelectTicket = (ticket) => {
    setCurrentTicket(ticket);
    navigate(`/tickets/${ticket.id}`);
  };

  const renderTicketInfo = () => {
    return (
      <TicketContainer
        button
        onClick={() => handleSelectTicket(ticket)}
        selected={ticketId && +ticketId === ticket.id}
      >
        <TicketQueueColor
          style={{ backgroundColor: ticketQueueColor || "#7C7C7C" }}
        />
        <ListItemAvatar>
          <Avatar
            src={ticket?.contact?.profilePicUrl}
            alt={ticket?.contact?.name}
          />
        </ListItemAvatar>
        <ListItemText
          disableTypography
          primary={
            <ContactNameWrapper>
              <Typography
                noWrap
                component="span"
                variant="body2"
                color="textPrimary"
              >
                {ticket?.contact?.name}
              </Typography>
              <LastMessageTime>
                <Typography
                  noWrap
                  component="span"
                  variant="body2"
                  color="textSecondary"
                >
                  {format(parseISO(ticket.updatedAt), "HH:mm")}
                </Typography>
              </LastMessageTime>
            </ContactNameWrapper>
          }
          secondary={
            <SecondaryContentSecond>
              <ContactLastMessage>
                <Typography
                  noWrap
                  component="span"
                  variant="body2"
                  color="textSecondary"
                >
                  <MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>
                </Typography>
              </ContactLastMessage>
              <TicketInfo1>
                {ticket.status === "closed" && (
                  <ClosedBadge>
                    <BadgeStyle badgeContent={"Fechado"} />
                  </ClosedBadge>
                )}
                {ticket.unreadMessages > 0 && (
                  <NewMessagesCount
                    badgeContent={ticket.unreadMessages}
                    color="primary"
                  />
                )}
              </TicketInfo1>
            </SecondaryContentSecond>
          }
        />
        <ListItemSecondaryAction>
          {ticket.status === "pending" && (
            <AcceptButton
              variant="contained"
              color="primary"
              onClick={() => handleAcepptTicket(ticket.id)}
              loading={loading}
            >
              {i18n.t("ticketsList.buttons.accept")}
            </AcceptButton>
          )}
          {ticket.status === "open" && (
            <ButtonWithSpinner
              variant="contained"
              color="primary"
              onClick={() => handleSendMessage(ticket.id)}
              loading={loading}
            >
              {i18n.t("ticketsList.buttons.sendMessage")}
            </ButtonWithSpinner>
          )}
          {ticket.status === "closed" && (
            <ButtonWithSpinner
              variant="contained"
              color="primary"
              onClick={() => handleReopenTicket(ticket.id)}
              loading={loading}
            >
              {i18n.t("ticketsList.buttons.reopen")}
            </ButtonWithSpinner>
          )}
        </ListItemSecondaryAction>
      </TicketContainer>
    );
  };

  return (
    <>
      {renderTicketInfo()}
      <Divider />
      <TicketMessagesDialog
        open={openTicketMessageDialog}
        handleClose={() => setOpenTicketMessageDialog(false)}
        ticketId={ticket.id}
      />
    </>
  );
};

export default TicketListItemCustom;
