import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from '@mui/material/styles';
import {
  Paper,
  Tabs,
  Tab,
  Badge,
  FormControlLabel,
  Switch,
  Button,
  InputBase,
  Box,
  IconButton,
  CircularProgress,
  Tooltip,
  ClickAwayListener,
  Popper,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField
} from "@mui/material";
import {
  Search as SearchIcon,
  MoveToInbox as MoveToInboxIcon,
  CheckBox as CheckBoxIcon,
  AttachFile as AttachFileIcon,
  Mood as MoodIcon,
  Send as SendIcon,
  Cancel as CancelIcon,
  Clear as ClearIcon,
  Mic as MicIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  HighlightOff as HighlightOffIcon,
  EmojiEmotions as EmojiEmotionsIcon,
  Stop as StopIcon
} from "@mui/icons-material";

import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import MicRecorder from "mic-recorder-to-mp3";
import { isNil, isString, isEmpty, isObject, has, debounce } from "lodash";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import axios from "axios";

import RecordingTimer from "./RecordingTimer";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import toastError from "../../errors/toastError";

import useQuickMessages from "../../hooks/useQuickMessages";
import { useAuth } from "../../context/Auth/AuthContext";
import { useTranslation } from "react-i18next";
import { useHotkeys } from "react-hotkeys-hook";

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

const MessageInputContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  padding: "10px",
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const MessageInputWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flex: 1,
  alignItems: "center",
  backgroundColor: theme.palette.background.paper,
  borderRadius: 20,
  border: `1px solid ${theme.palette.divider}`,
  padding: "5px 10px",
}));

const MessageInput = styled(TextField)(({ theme }) => ({
  flex: 1,
  margin: "0 10px",
  "& .MuiInputBase-root": {
    backgroundColor: theme.palette.background.paper,
  },
}));

const SendButton = styled(Button)(({ theme }) => ({
  minWidth: 0,
  padding: "8px",
  borderRadius: "50%",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const EmojiPopper = styled(Popper)(({ theme }) => ({
  zIndex: theme.zIndex.modal,
}));

const EmojiPaper = styled(Paper)(({ theme }) => ({
  maxHeight: 300,
  overflowY: "auto",
}));

const CustomInput = (props) => {
  const {
    loading,
    inputRef,
    ticketStatus,
    inputMessage,
    setInputMessage,
    handleSendMessage,
    handleInputPaste,
    disableOption,
    handleQuickAnswersClick,
  } = props;
  const [quickMessages, setQuickMessages] = useState([]);
  const [options, setOptions] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);

  const { user } = useContext(AuthContext);

  const { list: listQuickMessages } = useQuickMessages();

  useEffect(() => {
    async function fetchData() {
      const companyId = localStorage.getItem("companyId");
      const messages = await listQuickMessages({ companyId, userId: user.id });
      const options = messages.map((m) => {
        let truncatedMessage = m.message;
        if (isString(truncatedMessage) && truncatedMessage.length > 35) {
          truncatedMessage = m.message.substring(0, 35) + "...";
        }
        return {
          value: m.message,
          label: `/${m.shortcode} - ${truncatedMessage}`,
          mediaPath: m.mediaPath,
        };
      });
      setQuickMessages(options);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      isString(inputMessage) &&
      !isEmpty(inputMessage) &&
      inputMessage.length > 1
    ) {
      const firstWord = inputMessage.charAt(0);
      setPopupOpen(firstWord.indexOf("/") > -1);

      const filteredOptions = quickMessages.filter(
        (m) => m.label.indexOf(inputMessage) > -1
      );
      setOptions(filteredOptions);
    } else {
      setPopupOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMessage]);

  const onKeyPress = (e) => {
    if (loading || e.shiftKey) return;
    else if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const onPaste = (e) => {
    if (ticketStatus === "open") {
      handleInputPaste(e);
    }
  };

  const renderPlaceholder = () => {
    if (ticketStatus === "open") {
      return i18n.t("messagesInput.placeholderOpen");
    }
    return i18n.t("messagesInput.placeholderClosed");
  };

  const setInputRef = (input) => {
    if (input) {
      input.focus();
      inputRef.current = input;
    }
  };

  return (
    <MessageInputWrapper>
      <Autocomplete
        freeSolo
        open={popupOpen}
        id="grouped-demo"
        value={inputMessage}
        options={options}
        closeIcon={null}
        getOptionLabel={(option) => {
          if (isObject(option)) {
            return option.label;
          } else {
            return option;
          }
        }}
        onChange={(event, opt) => {
          if (isObject(opt) && has(opt, "value") && isNil(opt.mediaPath)) {
            setInputMessage(opt.value);
            setTimeout(() => {
              inputRef.current.scrollTop = inputRef.current.scrollHeight;
            }, 200);
          } else if (isObject(opt) && has(opt, "value") && !isNil(opt.mediaPath)) {
            handleQuickAnswersClick(opt);
            setTimeout(() => {
              inputRef.current.scrollTop = inputRef.current.scrollHeight;
            }, 200);
          }
        }}
        onInputChange={(event, opt, reason) => {
          if (reason === "input") {
            setInputMessage(event.target.value);
          }
        }}
        onPaste={onPaste}
        onKeyPress={onKeyPress}
        style={{ width: "100%" }}
        renderInput={(params) => {
          const { InputLabelProps, InputProps, ...rest } = params;
          return (
            <InputBase
              {...params.InputProps}
              {...rest}
              disabled={disableOption()}
              inputRef={setInputRef}
              placeholder={renderPlaceholder()}
              multiline
              maxRows={5}
            />
          );
        }}
      />
    </MessageInputWrapper>
  );
};

const MessageInputCustom = (props) => {
  const { ticketStatus, ticketId } = props;
  const { i18n } = useTranslation();
  const [medias, setMedias] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const inputRef = useRef();
  const { setReplyingMessage, replyingMessage } =
    useContext(ReplyMessageContext);
  const { user } = useAuth();
  const [signMessage, setSignMessage] = useLocalStorage("signOption", true);
  const [typeBar, setShowTypeBar] = useLocalStorage("showTypeBar", true);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current.focus();
  }, [replyingMessage]);

  useEffect(() => {
    inputRef.current.focus();
    return () => {
      setInputMessage("");
      setShowEmoji(false);
      setMedias([]);
      setReplyingMessage(null);
    };
  }, [ticketId, setReplyingMessage]);

  useEffect(() => {
    setShowTypeBar(typeBar);
  }, [typeBar]);

  useEffect(() => {
    if (ticketStatus === "open") {
      inputRef.current.focus();
    }
  }, [ticketStatus]);

  const handleAddEmoji = (e) => {
    let emoji = e.target.value;
    setInputMessage((prevState) => prevState + emoji);
  };

  const handleChangeMedias = (e) => {
    if (!e.target.files) {
      return;
    }

    const selectedMedias = Array.from(e.target.files);
    setMedias(selectedMedias);
  };

  const handleInputPaste = (e) => {
    if (e.clipboardData.files[0]) {
      setMedias([e.clipboardData.files[0]]);
    }
  };

  const handleUploadQuickMessageMedia = async (blob, message) => {
    setLoading(true);
    try {
      const extension = blob.type.split("/")[1];

      const formData = new FormData();
      const filename = `${new Date().getTime()}.${extension}`;
      formData.append("medias", blob, filename);
      formData.append("body", message);
      formData.append("fromMe", true);

      await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
    setLoading(false);
  };

  const handleQuickAnswersClick = async (value) => {
    if (value.mediaPath) {
      try {
        const { data } = await axios.get(value.mediaPath, {
          responseType: "blob",
        });

        handleUploadQuickMessageMedia(data, value.value);
        setInputMessage("");
        return;
      } catch (err) {
        toastError(err);
      }
    }

    setInputMessage(value.value);
  };

  const handleUploadMedia = async (e) => {
    setLoading(true);
    e.preventDefault();

    const formData = new FormData();
    formData.append("fromMe", true);
    medias.forEach((media) => {
      formData.append("medias", media);
      formData.append("body", media.name);
    });

    try {
      await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toastError(err);
    }

    setLoading(false);
    setMedias([]);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;
    setLoading(true);

    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: signMessage
        ? `*${user?.name}:*\n${inputMessage.trim()}`
        : inputMessage.trim(),
      quotedMsg: replyingMessage,
    };
    try {
      await api.post(`/messages/${ticketId}`, message);
    } catch (err) {
      toastError(err);
    }

    setInputMessage("");
    setShowEmoji(false);
    setLoading(false);
    setReplyingMessage(null);
  };

  const handleStartRecording = async () => {
    setRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      setMediaRecorder(mediaRecorder);
      mediaRecorder.start();
    } catch (err) {
      toastError(err);
    }
  };

  const handleStopRecording = async () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
      mediaRecorder.ondataavailable = async e => {
        const formData = new FormData();
        formData.append("medias", e.data, "audio.ogg");
        formData.append("body", "audio.ogg");
        formData.append("fromMe", true);
        try {
          await api.post(`/messages/${ticketId}`, formData);
        } catch (err) {
          toastError(err);
        }
      };
    }
  };

  const handleCloseEmoji = () => {
    setShowEmoji(false);
  };

  const handleOpenEmoji = e => {
    setAnchorEl(e.currentTarget);
    setShowEmoji(true);
  };

  const disableOption = () => {
    return loading || recording || ticketStatus !== "open";
  };

  const renderReplyingMessage = (message) => {
    return (
      <Box sx={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "center", paddingTop: 1, paddingLeft: 9, paddingRight: 1 }}>
        <Box sx={{ flex: 1, marginRight: 0.5, overflowY: "hidden", backgroundColor: "rgba(0, 0, 0, 0.05)", borderRadius: "7.5px", display: "flex", position: "relative" }}>
          <Box sx={{ flex: "none", width: "4px", backgroundColor: message.fromMe ? "#6bcbef" : "#35cd96" }} />
          <Box sx={{ padding: 1.25, height: "auto", display: "block", whiteSpace: "pre-wrap", overflow: "hidden" }}>
            {!message.fromMe && (
              <Box sx={{ display: "flex", color: "#6bcbef", fontWeight: 500 }}>
                {message.contact?.name}
              </Box>
            )}
            {message.body}
          </Box>
        </Box>
        <IconButton
          aria-label="showRecorder"
          component="span"
          disabled={loading || ticketStatus !== "open"}
          onClick={() => setReplyingMessage(null)}
        >
          <ClearIcon />
        </IconButton>
      </Box>
    );
  };

  const debouncedHandleSendMessage = debounce(handleSendMessage, 500);

  useHotkeys("enter", () => {
    debouncedHandleSendMessage();
  });

  const handleNavigateToTicket = (ticketId) => {
    setLoading(true);
    try {
      navigate(`/tickets/${ticketId}`);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  if (medias.length > 0)
    return (
      <Paper elevation={0} square sx={{ display: "flex", padding: "10px 13px", position: "relative", justifyContent: "space-between", alignItems: "center", backgroundColor: "#eee", borderTop: "1px solid rgba(0, 0, 0, 0.12)" }}>
        <IconButton
          aria-label="cancel-upload"
          component="span"
          onClick={(e) => setMedias([])}
        >
          <CancelIcon />
        </IconButton>

        {loading ? (
          <Box>
            <CircularProgress sx={{ color: "green", opacity: "70%", position: "absolute", top: "20%", left: "50%", marginLeft: -1.5 }} />
          </Box>
        ) : (
          <Box>
            {medias[0]?.name}
          </Box>
        )}
        <IconButton
          aria-label="send-upload"
          component="span"
          onClick={handleUploadMedia}
          disabled={loading}
        >
          <SendIcon />
        </IconButton>
      </Paper>
    );
  else {
    return (
      <MessageInputContainer>
        <MessageInputWrapper>
          <Tooltip title="Emoji">
            <IconButton onClick={handleOpenEmoji} size="small">
              <EmojiEmotionsIcon />
            </IconButton>
          </Tooltip>
          <MessageInput
            inputRef={inputRef}
            placeholder={
              ticketContact?.number && `${i18n.t("messagesList.input.placeholder")}`
            }
            multiline
            maxRows={5}
            value={inputMessage}
            onChange={handleChangeInput}
            disabled={ticketStatus !== "open" || loading}
            onKeyPress={e => {
              if (loading || e.shiftKey) return;
              else if (e.key === "Enter") {
                debouncedHandleSendMessage();
              }
            }}
          />
          <input
            multiple
            type="file"
            id="upload-button"
            disabled={ticketStatus !== "open" || loading}
            style={{ display: "none" }}
            onChange={handleChangeMedias}
          />
          <label htmlFor="upload-button">
            <IconButton
              component="span"
              disabled={ticketStatus !== "open" || loading}
            >
              <AttachFileIcon />
            </IconButton>
          </label>
          {recording && <RecordingTimer />}
          {!recording ? (
            <Tooltip title="Gravar áudio">
              <IconButton
                onClick={handleStartRecording}
                disabled={ticketStatus !== "open" || loading}
                size="small"
              >
                <MicIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Parar gravação">
              <IconButton
                onClick={handleStopRecording}
                disabled={ticketStatus !== "open" || loading}
                size="small"
              >
                <StopIcon />
              </IconButton>
            </Tooltip>
          )}
          <SendButton
            onClick={handleSendMessage}
            disabled={ticketStatus !== "open" || loading || inputMessage.trim() === ""}
          >
            {loading ? <CircularProgress size={24} /> : <SendIcon />}
          </SendButton>
        </MessageInputWrapper>
        <EmojiPopper
          open={showEmoji}
          anchorEl={anchorEl}
          placement="top-start"
        >
          <ClickAwayListener onClickAway={handleCloseEmoji}>
            <EmojiPaper>
              <MenuList>
                <MenuItem onClick={() => handleAddEmoji({ target: { value: "😊" } })}>
                  <ListItemIcon>
                    <EmojiEmotionsIcon />
                  </ListItemIcon>
                  <ListItemText primary="😊" />
                </MenuItem>
                <MenuItem onClick={() => handleAddEmoji({ target: { value: "👍" } })}>
                  <ListItemIcon>
                    <EmojiEmotionsIcon />
                  </ListItemIcon>
                  <ListItemText primary="👍" />
                </MenuItem>
              </MenuList>
            </EmojiPaper>
          </ClickAwayListener>
        </EmojiPopper>
      </MessageInputContainer>
    );
  }
};

export default MessageInputCustom;
