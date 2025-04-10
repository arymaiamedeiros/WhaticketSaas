import React, { useState, useEffect, useReducer, useRef } from "react";
import { isSameDay, parseISO, format } from "date-fns";
import { styled } from "@mui/material/styles";
import { green } from "@mui/material/colors";
import {
  Button,
  CircularProgress,
  Divider,
  IconButton,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  Block as BlockIcon,
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
  ExpandMore as ExpandMoreIcon,
  GetApp as GetAppIcon,
} from "@mui/icons-material";

import MarkdownWrapper from "../MarkdownWrapper";
import ModalImageCors from "../ModalImageCors";
import MessageOptionsMenu from "../MessageOptionsMenu";
import whatsBackground from "../../assets/wa-background.png";
import LocationPreview from "../LocationPreview";
import whatsBackgroundDark from "../../assets/wa-background-dark.png";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { socketConnection } from "../../services/socket";

const MessagesListWrapper = styled("div")(({ theme }) => ({
  overflow: "hidden",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  width: "100%",
  minWidth: 300,
  minHeight: 200,
}));

const MessagesList = styled("div")(({ theme }) => ({
  backgroundImage: theme.palette.mode === 'light' ? `url(${whatsBackground})` : `url(${whatsBackgroundDark})`,
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  padding: "20px 20px 20px 20px",
  overflowY: "scroll",
  ...theme.scrollbarStyles,
}));

const CircleLoading = styled(CircularProgress)({
  color: green[500],
  position: "absolute",
  opacity: "70%",
  top: 0,
  left: "50%",
  marginTop: 12,
});

const MessageLeft = styled("div")({
  marginRight: 20,
  marginTop: 2,
  minWidth: 100,
  maxWidth: 600,
  height: "auto",
  display: "block",
  position: "relative",
  "&:hover #messageActionsButton": {
    display: "flex",
    position: "absolute",
    top: 0,
    right: 0,
  },
  whiteSpace: "pre-wrap",
  backgroundColor: "#ffffff",
  color: "#303030",
  alignSelf: "flex-start",
  borderTopLeftRadius: 0,
  borderTopRightRadius: 8,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
  paddingLeft: 5,
  paddingRight: 5,
  paddingTop: 5,
  paddingBottom: 0,
  boxShadow: "0 1px 1px #b3b3b3",
});

const QuotedContainerLeft = styled("div")({
  margin: "-3px -80px 6px -6px",
  overflow: "hidden",
  backgroundColor: "#f0f0f0",
  borderRadius: "7.5px",
  display: "flex",
  position: "relative",
});

const QuotedMsg = styled("div")({
  padding: 10,
  maxWidth: 300,
  height: "auto",
  display: "block",
  whiteSpace: "pre-wrap",
  overflow: "hidden",
});

const QuotedSideColorLeft = styled("div")({
  flex: "none",
  width: "4px",
  backgroundColor: "#6bcbef",
});

const MessageRight = styled("div")({
  marginLeft: 20,
  marginTop: 2,
  minWidth: 100,
  maxWidth: 600,
  height: "auto",
  display: "block",
  position: "relative",
  "&:hover #messageActionsButton": {
    display: "flex",
    position: "absolute",
    top: 0,
    right: 0,
  },
  whiteSpace: "pre-wrap",
  backgroundColor: "#dcf8c6",
  color: "#303030",
  alignSelf: "flex-end",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 0,
  paddingLeft: 5,
  paddingRight: 5,
  paddingTop: 5,
  paddingBottom: 0,
  boxShadow: "0 1px 1px #b3b3b3",
});

const QuotedContainerRight = styled("div")({
  margin: "-3px -80px 6px -6px",
  overflowY: "hidden",
  backgroundColor: "#cfe9ba",
  borderRadius: "7.5px",
  display: "flex",
  position: "relative",
});

const QuotedMsgRight = styled("div")({
  padding: 10,
  maxWidth: 300,
  height: "auto",
  whiteSpace: "pre-wrap",
});

const QuotedSideColorRight = styled("div")({
  flex: "none",
  width: "4px",
  backgroundColor: "#35cd96",
});

const MessageActionsButton = styled(IconButton)({
  display: "none",
  position: "relative",
  color: "#999",
  zIndex: 1,
  backgroundColor: "inherit",
  opacity: "90%",
  "&:hover, &.Mui-focusVisible": { backgroundColor: "inherit" },
});

const MessageContactName = styled("div")({
  display: "flex",
  color: "#6bcbef",
  fontWeight: 500,
});

const TextContentItem = styled("div")({
  overflowWrap: "break-word",
  padding: "3px 80px 6px 6px",
});

const TextContentItemEdited = styled("div")({
  overflowWrap: "break-word",
  padding: "3px 120px 6px 6px",
});

const TextContentItemDeleted = styled("div")({
  fontStyle: "italic",
  color: "rgba(0, 0, 0, 0.36)",
  overflowWrap: "break-word",
  padding: "3px 80px 6px 6px",
});

const MessageMedia = styled("img")({
  objectFit: "cover",
  width: 250,
  height: 200,
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
});

const Timestamp = styled("div")({
  fontSize: 11,
  position: "absolute",
  bottom: 0,
  right: 5,
  color: "#999",
});

const DailyTimestamp = styled("div")({
  alignItems: "center",
  textAlign: "center",
  alignSelf: "center",
  width: "110px",
  backgroundColor: "#e1f3fb",
  margin: "10px",
  borderRadius: "10px",
  boxShadow: "0 1px 1px #b3b3b3",
});

const DailyTimestampText = styled("div")({
  color: "#808888",
  padding: 8,
  alignSelf: "center",
  marginLeft: "0px",
});

const AckIcons = styled("span")({
  fontSize: 18,
  verticalAlign: "middle",
  marginLeft: 4,
});

const DeletedIcon = styled("span")({
  fontSize: 18,
  verticalAlign: "middle",
});

const reducer = (state, action) => {
  if (action.type === "LOAD_MESSAGES") {
    const messages = action.payload;
    const newMessages = [];

    messages.forEach((message) => {
      const messageIndex = state.findIndex((m) => m.id === message.id);
      if (messageIndex !== -1) {
        state[messageIndex] = message;
      } else {
        newMessages.push(message);
      }
    });

    return [...newMessages, ...state];
  }

  if (action.type === "ADD_MESSAGE") {
    const newMessage = action.payload;
    const messageIndex = state.findIndex((m) => m.id === newMessage.id);

    if (messageIndex !== -1) {
      state[messageIndex] = newMessage;
    } else {
      state.push(newMessage);
    }

    return [...state];
  }

  if (action.type === "UPDATE_MESSAGE") {
    const messageToUpdate = action.payload;
    const messageIndex = state.findIndex((m) => m.id === messageToUpdate.id);

    if (messageIndex !== -1) {
      state[messageIndex] = messageToUpdate;
    }

    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const MessagesListComponent = ({ ticket, ticketId, isGroup }) => {
  const [messagesList, dispatch] = useReducer(reducer, []);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const lastMessageRef = useRef();

  const [selectedMessage, setSelectedMessage] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const messageOptionsMenuOpen = Boolean(anchorEl);
  const currentTicketId = useRef(ticketId);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);

    currentTicketId.current = ticketId;
  }, [ticketId]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchMessages = async () => {
        if (ticketId === undefined) return;
        try {
          const { data } = await api.get("/messages/" + ticketId, {
            params: { pageNumber },
          });

          if (currentTicketId.current === ticketId) {
            dispatch({ type: "LOAD_MESSAGES", payload: data.messages });
            setHasMore(data.hasMore);
            setLoading(false);
          }

          if (pageNumber === 1 && data.messages.length > 1) {
            scrollToBottom();
          }
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };
      fetchMessages();
    }, 500);
    return () => {
      clearTimeout(delayDebounceFn);
    };
  }, [pageNumber, ticketId]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketConnection({ companyId });

    socket.on("connect", () => socket.emit("joinChatBox", `${ticket.id}`));

    socket.on(`company-${companyId}-appMessage`, (data) => {
      if (data.action === "create") {
        dispatch({ type: "ADD_MESSAGE", payload: data.message });
        scrollToBottom();
      }

      if (data.action === "update") {
        dispatch({ type: "UPDATE_MESSAGE", payload: data.message });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [ticketId, ticket]);

  const loadMore = () => {
    setPageNumber((prevPageNumber) => prevPageNumber + 1);
  };

  const scrollToBottom = () => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({});
    }
  };

  const handleScroll = (e) => {
    if (!hasMore) return;
    const { scrollTop } = e.currentTarget;

    if (scrollTop === 0) {
      document.getElementById("messagesList").scrollTop = 1;
    }

    if (loading) {
      return;
    }

    if (scrollTop < 50) {
      loadMore();
    }
  };

  const handleOpenMessageOptionsMenu = (e, message) => {
    setAnchorEl(e.currentTarget);
    setSelectedMessage(message);
  };

  const handleCloseMessageOptionsMenu = (e) => {
    setAnchorEl(null);
  };

  const checkMessageMedia = (message) => {
    if (message.mediaType === "locationMessage" && message.body.split('|').length >= 2) {
      let locationParts = message.body.split('|')
      let imageLocation = locationParts[0]
      let linkLocation = locationParts[1]

      let descriptionLocation = null

      if (locationParts.length > 2)
        descriptionLocation = message.body.split('|')[2]

      return <LocationPreview image={imageLocation} link={linkLocation} description={descriptionLocation} />
    }
    /* else if (message.mediaType === "vcard") {
      let array = message.body.split("\n");
      let obj = [];
      let contact = "";
      for (let index = 0; index < array.length; index++) {
        const v = array[index];
        let values = v.split(":");
        for (let ind = 0; ind < values.length; ind++) {
          if (values[ind].indexOf("+") !== -1) {
            obj.push({ number: values[ind] });
          }
          if (values[ind].indexOf("FN") !== -1) {
            contact = values[ind + 1];
          }
        }
      }
      return <VcardPreview contact={contact} numbers={obj[0].number} />
    } */
    /*else if (message.mediaType === "multi_vcard") {
      console.log("multi_vcard")
      console.log(message)
    	
      if(message.body !== null && message.body !== "") {
        let newBody = JSON.parse(message.body)
        return (
          <>
            {
            newBody.map(v => (
              <VcardPreview contact={v.name} numbers={v.number} />
            ))
            }
          </>
        )
      } else return (<></>)
    }*/
    else if (message.mediaType === "image") {
      return <ModalImageCors imageUrl={message.mediaUrl} />;
    } else if (message.mediaType === "audio") {
      return (
        <audio controls>
          <source src={message.mediaUrl} type="audio/ogg"></source>
        </audio>
      );
    } else if (message.mediaType === "video") {
      return (
        <video
          className={MessageMedia}
          src={message.mediaUrl}
          controls
        />
      );
    } else {
      return (
        <>
          <div className={classes.downloadMedia}>
            <Button
              startIcon={<GetAppIcon />}
              color="primary"
              variant="outlined"
              target="_blank"
              href={message.mediaUrl}
            >
              Download
            </Button>
          </div>
          <Divider />
        </>
      );
    }
  };

  const renderMessageAck = (message) => {
    if (message.ack === 1) {
      return <AccessTimeIcon fontSize="small" className={AckIcons} />;
    }
    if (message.ack === 2) {
      return <DoneIcon fontSize="small" className={AckIcons} />;
    }
    if (message.ack === 3) {
      return <DoneAllIcon fontSize="small" className={AckIcons} />;
    }
    if (message.ack === 4 || message.ack === 5) {
      return <DoneAllIcon fontSize="small" className={classes.ackDoneAllIcon} />;
    }
  };

  const renderDailyTimestamps = (message, index) => {
    if (index === 0) {
      return (
        <span
          className={DailyTimestamp}
          key={`timestamp-${message.id}`}
        >
          <div className={DailyTimestampText}>
            {format(parseISO(messagesList[index].createdAt), "dd/MM/yyyy")}
          </div>
        </span>
      );
    }
    if (index < messagesList.length - 1) {
      let messageDay = parseISO(messagesList[index].createdAt);
      let previousMessageDay = parseISO(messagesList[index - 1].createdAt);

      if (!isSameDay(messageDay, previousMessageDay)) {
        return (
          <span
            className={DailyTimestamp}
            key={`timestamp-${message.id}`}
          >
            <div className={DailyTimestampText}>
              {format(parseISO(messagesList[index].createdAt), "dd/MM/yyyy")}
            </div>
          </span>
        );
      }
    }
    if (index === messagesList.length - 1) {
      return (
        <div
          key={`ref-${message.createdAt}`}
          ref={lastMessageRef}
          style={{ float: "left", clear: "both" }}
        />
      );
    }
  };

  const renderNumberTicket = (message, index) => {
    if (index < messagesList.length && index > 0) {

      let messageTicket = message.ticketId;
      let connectionName = message.ticket?.whatsapp?.name;
      let previousMessageTicket = messagesList[index - 1].ticketId;

      if (messageTicket !== previousMessageTicket) {
        return (
          <center>
            <div className={classes.ticketNunberClosed}>
              Conversa encerrada: {format(parseISO(messagesList[index - 1].createdAt), "dd/MM/yyyy HH:mm:ss")}
            </div>

            <div className={classes.ticketNunberOpen}>
              Conversa iniciada: {format(parseISO(message.createdAt), "dd/MM/yyyy HH:mm:ss")}
            </div>
          </center>
        );
      }
    }
  };

  const renderMessageDivider = (message, index) => {
    if (index < messagesList.length && index > 0) {
      let messageUser = messagesList[index].fromMe;
      let previousMessageUser = messagesList[index - 1].fromMe;

      if (messageUser !== previousMessageUser) {
        return (
          <span style={{ marginTop: 16 }} key={`divider-${message.id}`}></span>
        );
      }
    }
  };

  const renderQuotedMessage = (message) => {
    return (
      <div
        className={clsx(QuotedContainerLeft, {
          [QuotedContainerRight]: message.fromMe,
        })}
      >
        <span
          className={clsx(QuotedSideColorLeft, {
            [QuotedSideColorRight]: message.quotedMsg?.fromMe,
          })}
        ></span>
        <div className={QuotedMsg}>
          {!message.quotedMsg?.fromMe && (
            <span className={MessageContactName}>
              {message.quotedMsg?.contact?.name}
            </span>
          )}

          {message.quotedMsg.mediaType === "audio"
            && (
              <div className={classes.downloadMedia}>
                <audio controls>
                  <source src={message.quotedMsg.mediaUrl} type="audio/ogg"></source>
                </audio>
              </div>
            )
          }
          {message.quotedMsg.mediaType === "video"
            && (
              <video
                className={MessageMedia}
                src={message.quotedMsg.mediaUrl}
                controls
              />
            )
          }
          {message.quotedMsg.mediaType === "application"
            && (
              <div className={classes.downloadMedia}>
                <Button
                  startIcon={<GetAppIcon />}
                  color="primary"
                  variant="outlined"
                  target="_blank"
                  href={message.quotedMsg.mediaUrl}
                >
                  Download
                </Button>
              </div>
            )
          }

          {message.quotedMsg.mediaType === "image"
            && (
              <ModalImageCors imageUrl={message.quotedMsg.mediaUrl} />)
            || message.quotedMsg?.body}

        </div>
      </div>
    );
  };

  const renderMessages = () => {
    if (messagesList.length > 0) {
      const viewMessagesList = messagesList.map((message, index) => {

        if (message.mediaType === "call_log") {
          return (
            <React.Fragment key={message.id}>
              {renderDailyTimestamps(message, index)}
              {renderNumberTicket(message, index)}
              {renderMessageDivider(message, index)}
              <div className={classes.messageCenter}>
                <IconButton
                  variant="contained"
                  size="small"
                  id="messageActionsButton"
                  disabled={message.isDeleted}
                  className={classes.messageActionsButton}
                  onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
                >
                  <ExpandMoreIcon />
                </IconButton>
                {isGroup && (
                  <span className={MessageContactName}>
                    {message.contact?.name}
                  </span>
                )}
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 17" width="20" height="17">
                    <path fill="#df3333" d="M18.2 12.1c-1.5-1.8-5-2.7-8.2-2.7s-6.7 1-8.2 2.7c-.7.8-.3 2.3.2 2.8.2.2.3.3.5.3 1.4 0 3.6-.7 3.6-.7.5-.2.8-.5.8-1v-1.3c.7-1.2 5.4-1.2 6.4-.1l.1.1v1.3c0 .2.1.4.2.6.1.2.3.3.5.4 0 0 2.2.7 3.6.7.2 0 1.4-2 .5-3.1zM5.4 3.2l4.7 4.6 5.8-5.7-.9-.8L10.1 6 6.4 2.3h2.5V1H4.1v4.8h1.3V3.2z"></path>
                  </svg> <span>Chamada de voz/vídeo perdida às {format(parseISO(message.createdAt), "HH:mm")}</span>
                </div>
              </div>
            </React.Fragment>
          );
        }

        if (!message.fromMe) {
          return (
            <React.Fragment key={message.id}>
              {renderDailyTimestamps(message, index)}
              {renderNumberTicket(message, index)}
              {renderMessageDivider(message, index)}
              <div className={MessageLeft}>
                <IconButton
                  variant="contained"
                  size="small"
                  id="messageActionsButton"
                  disabled={message.isDeleted}
                  className={classes.messageActionsButton}
                  onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
                >
                  <ExpandMoreIcon />
                </IconButton>
                {isGroup && (
                  <span className={MessageContactName}>
                    {message.contact?.name}
                  </span>
                )}

                {/* aviso de mensagem apagado pelo contato */}
                {message.isDeleted && (
                  <div>
                    <span className={"message-deleted"}
                    >Essa mensagem foi apagada pelo contato &nbsp;
                      <BlockIcon
                        color="error"
                        fontSize="small"
                        className={DeletedIcon}
                      />
                    </span>
                  </div>
                )}

                {(message.mediaUrl || message.mediaType === "locationMessage" || message.mediaType === "vcard"
                  //|| message.mediaType === "multi_vcard" 
                ) && checkMessageMedia(message)}
                <div className={TextContentItem}>
                  {message.quotedMsg && renderQuotedMessage(message)}
                  <MarkdownWrapper>{message.mediaType === "locationMessage" ? null : message.body}</MarkdownWrapper>
                  <span className={Timestamp}>
				    {message.isEdited && <span>Editada </span>}
                    {format(parseISO(message.createdAt), "HH:mm")}
                  </span>
                </div>
              </div>
            </React.Fragment>
          );
        } else {
          return (
            <React.Fragment key={message.id}>
              {renderDailyTimestamps(message, index)}
              {renderNumberTicket(message, index)}
              {renderMessageDivider(message, index)}
              <div className={MessageRight}>
                <IconButton
                  variant="contained"
                  size="small"
                  id="messageActionsButton"
                  disabled={message.isDeleted}
                  className={classes.messageActionsButton}
                  onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
                >
                  <ExpandMoreIcon />
                </IconButton>
                {(message.mediaUrl || message.mediaType === "locationMessage" || message.mediaType === "vcard"
                  //|| message.mediaType === "multi_vcard" 
                ) && checkMessageMedia(message)}
                <div
                  className={clsx(TextContentItem, {
                    [TextContentItemDeleted]: message.isDeleted,
					[TextContentItemEdited]: message.isEdited,
                  })}
                >
                  {message.isDeleted && (
                    <BlockIcon
                      color="disabled"
                      fontSize="small"
                      className={DeletedIcon}
                    />
                  )}
                  {message.quotedMsg && renderQuotedMessage(message)}
                  <MarkdownWrapper>{message.body}</MarkdownWrapper>
                  <span className={Timestamp}>
				    {message.isEdited && <span>Editada </span>}
                    {format(parseISO(message.createdAt), "HH:mm")}
                    {renderMessageAck(message)}
                  </span>
                </div>
              </div>
            </React.Fragment>
          );
        }
      });
      return viewMessagesList;
    } else {
      return <div>Diga olá para seu novo contato!</div>;
    }
  };

  return (
    <MessagesListWrapper>
      <MessageOptionsMenu
        message={selectedMessage}
        anchorEl={anchorEl}
        menuOpen={messageOptionsMenuOpen}
        handleClose={handleCloseMessageOptionsMenu}
      />
      <div
        id="messagesList"
        className={MessagesList}
        onScroll={handleScroll}
      >
        {loading && <CircleLoading size={24} />}
        {hasMore && (
          <Button
            onClick={loadMore}
            variant="contained"
            color="primary"
            sx={{ alignSelf: "center", my: 2 }}
          >
            Carregar mais mensagens
          </Button>
        )}
        {renderMessages()}
      </div>
    </MessagesListWrapper>
  );
};

export default MessagesListComponent;
