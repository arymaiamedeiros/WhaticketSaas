import React, { useState, useEffect, useRef } from "react";
import { styled } from '@mui/material/styles';
import {
  Paper,
  IconButton,
  InputBase,
  CircularProgress,
  Typography,
  Box,
  Avatar,
  AppBar,
  Toolbar
} from "@mui/material";
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { green } from '@mui/material/colors';
import { useDate } from "../../hooks/useDate";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const Container = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  background: theme.palette.background.default,
}));

const Header = styled(AppBar)(({ theme }) => ({
  position: "relative",
  background: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: "none",
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ContactInfo = styled(Box)({
  display: "flex",
  alignItems: "center",
  padding: "8px 0",
});

const MessagesList = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: "scroll",
  padding: theme.spacing(2),
  ...theme.scrollbarStyles,
}));

const InputContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  display: "flex",
  alignItems: "center",
  background: theme.palette.background.paper,
}));

const MessageBubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isMe",
})(({ theme, isMe }) => ({
  background: isMe ? green[500] : theme.palette.background.paper,
  color: isMe ? theme.palette.common.white : theme.palette.text.primary,
  padding: theme.spacing(1, 2),
  borderRadius: 16,
  marginBottom: theme.spacing(1),
  maxWidth: "80%",
  alignSelf: isMe ? "flex-end" : "flex-start",
  boxShadow: theme.shadows[1],
}));

const MessageTime = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  color: "inherit",
  opacity: 0.6,
  marginLeft: theme.spacing(1),
}));

const ChatMessages = ({ contact, handleClose }) => {
  const date = useDate();
  const scrollRef = useRef();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact.id, pageNumber]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/messages/${contact.id}`, {
        params: { pageNumber },
      });
      setMessages((prev) => [...data.messages, ...prev]);
      setHasMore(data.hasMore);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e) => {
    if (!hasMore) return;
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0) {
      setPageNumber((prev) => prev + 1);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() && !attachment) return;

    try {
      const formData = new FormData();
      if (attachment) {
        formData.append("file", attachment);
      }
      formData.append("message", message);

      await api.post(`/messages/${contact.id}`, formData);
      setMessage("");
      setAttachment(null);
      loadMessages();
    } catch (err) {
      toastError(err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleUploadFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment(file);
    }
  };

  return (
    <Container>
      <Header>
        <Toolbar>
          <IconButton edge="start" onClick={handleClose} size="large">
            <ArrowBackIcon />
          </IconButton>
          <ContactInfo>
            <Avatar src={contact.profilePicUrl} />
            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle1">{contact.name}</Typography>
              {contact.isOnline && (
                <Typography variant="caption" color="textSecondary">
                  {i18n.t("chat.online")}
                </Typography>
              )}
            </Box>
          </ContactInfo>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton size="large">
            <MoreVertIcon />
          </IconButton>
        </Toolbar>
      </Header>

      <MessagesList ref={scrollRef} onScroll={handleScroll}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <CircularProgress />
          </Box>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} isMe={message.fromMe}>
            <Typography variant="body1">{message.body}</Typography>
            <MessageTime component="span">
              {date.format(message.createdAt)}
            </MessageTime>
          </MessageBubble>
        ))}
      </MessagesList>

      <InputContainer elevation={0}>
        <input
          type="file"
          id="upload-button"
          style={{ display: "none" }}
          onChange={handleUploadFile}
        />
        <label htmlFor="upload-button">
          <IconButton component="span" size="large">
            <AttachFileIcon />
          </IconButton>
        </label>
        {attachment && (
          <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
            <Typography variant="body2" noWrap>
              {attachment.name}
            </Typography>
            <IconButton size="small" onClick={() => setAttachment(null)}>
              <CloseIcon />
            </IconButton>
          </Box>
        )}
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder={i18n.t("chat.typeMessage")}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={4}
        />
        <IconButton onClick={handleSendMessage} size="large">
          <SendIcon />
        </IconButton>
      </InputContainer>
    </Container>
  );
};

export default ChatMessages;
