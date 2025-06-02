import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { makeStyles } from "@material-ui/core/styles";
import toastError from "../../errors/toastError";
import Popover from "@material-ui/core/Popover";
import ForumIcon from "@material-ui/icons/Forum";
import {
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@material-ui/core";
import api from "../../services/api";
import { isArray } from "lodash";
import { SocketContext } from "../../context/Socket/SocketContext";
import { useDate } from "../../hooks/useDate";
import { AuthContext } from "../../context/Auth/AuthContext";

import notifySound from "../../assets/chat_notify.mp3";
import useSound from "use-sound";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    maxHeight: 300,
    maxWidth: 500,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }

    return [...state, ...newChats];
  }

  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);

    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }

  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;

    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

export default function ChatPopover() {
  const classes = useStyles();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const [invisible, setInvisible] = useState(true);
  const { datetimeToClient } = useDate();
  const [play] = useSound(notifySound);
  const soundAlertRef = useRef();
  const isMountedRef = useRef(true);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    soundAlertRef.current = play;

    if (!("Notification" in window)) {
      console.log("This browser doesn't support notifications");
    } else {
      Notification.requestPermission();
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [play]);

  useEffect(() => {
    if (!isMountedRef.current) return;
    
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      if (isMountedRef.current) {
        fetchChats();
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);
    if (!socket) {
      return () => {
        isMountedRef.current = false;
      }; 
    }
    
    const handleChatEvent = (data) => {
      if (!isMountedRef.current) return;
      
      if (data.action === "new-message") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
        const userIds = data.newMessage.chat.users.map(userObj => userObj.userId);

        if (userIds.includes(user.id) && data.newMessage.senderId !== user.id) {
          soundAlertRef.current();
        }
      }
      if (data.action === "update") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
    };
    
    socket.on(`company-${companyId}-chat`, handleChatEvent);
    
    return () => {
      isMountedRef.current = false;
      
      try {
        socket.off(`company-${companyId}-chat`, handleChatEvent);
      } catch (err) {
        console.error("Erro ao remover listener do socket:", err);
      }
    };
  }, [socketManager, user.id]);

  useEffect(() => {
    if (!isMountedRef.current) return;
    
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    if (unreadsCount > 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  }, [chats, user.id]);

  const fetchChats = async () => {
    if (!isMountedRef.current) return;
    
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      if (isMountedRef.current) {
        dispatch({ type: "LOAD_CHATS", payload: data.records });
        setHasMore(data.hasMore);
        setLoading(false);
      }
    } catch (err) {
      if (isMountedRef.current) {
        toastError(err);
        setLoading(false);
      }
    }
  };

  const loadMore = () => {
    if (isMountedRef.current) {
      setPageNumber((prevState) => prevState + 1);
    }
  };

  const handleScroll = (e) => {
    if (!hasMore || loading || !isMountedRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const handleClick = (event) => {
    if (isMountedRef.current) {
      setAnchorEl(event.currentTarget);
      setInvisible(true);
    }
  };

  const handleClose = () => {
    if (isMountedRef.current) {
      setAnchorEl(null);
    }
  };

  const goToMessages = (chat) => {
    window.location.href = `/chats/${chat.uuid}`;
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      <IconButton
        aria-describedby={id}
        variant="contained"
        color={invisible ? "default" : "inherit"}
        onClick={handleClick}
        style={{ color: "white" }}
      >
        <Badge color="secondary" variant="dot" invisible={invisible}>
          <ForumIcon />
        </Badge>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Paper className={classes.mainPaper} onScroll={handleScroll}>
          <List dense>
            {chats.length === 0 && !loading ? (
              <ListItem>
                <ListItemText
                  primary={i18n.t("chatPopover.title.empty")}
                />
              </ListItem>
            ) : (
              <>
                {chats.map((chat) => {
                  return (
                    <ListItem
                      key={chat.id}
                      button
                      onClick={() => {
                        goToMessages(chat);
                      }}
                    >
                      <ListItemText
                        primary={
                          <>
                            {chat.lastMessage && (
                              <Typography
                                variant="subtitle2"
                                color="primary"
                                gutterBottom
                              >
                                {chat.users.map((user) => (
                                  <span key={user.id}>{user.name}</span>
                                ))}
                              </Typography>
                            )}
                          </>
                        }
                        secondary={
                          <>
                            {chat.lastMessage && (
                              <Typography
                                variant="subtitle2"
                                style={{ fontSize: "11px" }}
                                display="block"
                                color="textSecondary"
                              >
                                {datetimeToClient(chat.updatedAt)}
                              </Typography>
                            )}
                            {chat.lastMessage && (
                              <>
                                {chat.lastMessage.sender?.name}
                                {": "}
                                {chat.lastMessage?.body}
                              </>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  );
                })}
              </>
            )}
          </List>
        </Paper>
      </Popover>
    </div>
  );
}
