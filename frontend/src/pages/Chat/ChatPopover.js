import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { styled } from '@mui/material/styles';
import toastError from "../../errors/toastError";
import Popover from "@mui/material/Popover";
import { Chat as ChatIcon } from "@mui/icons-material";
import {
  Badge,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import api from "../../services/api";
import { isArray } from "lodash";
import { socketConnection } from "../../services/socket";
import { useDate } from "../../hooks/useDate";
import { AuthContext } from "../../context/Auth/AuthContext";

import notifySound from "../../assets/chat_notify.mp3";
import useSound from "use-sound";
import { i18n } from "../../translate/i18n";

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
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

const ChatPopover = ({ chats, handleClickChat }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'chat-popover' : undefined;

  const unreadMessages = chats.reduce((acc, chat) => {
    return acc + chat.unreadMessages;
  }, 0);

  return (
    <div>
      <IconButton
        aria-describedby={id}
        onClick={handleClick}
        size="large"
      >
        <StyledBadge badgeContent={unreadMessages} color="secondary">
          <ChatIcon />
        </StyledBadge>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ width: 300, maxHeight: 400, overflow: 'auto' }}>
          <List>
            {chats.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="body2" color="textSecondary">
                      {i18n.t("chat.noMessages")}
                    </Typography>
                  }
                />
              </ListItem>
            ) : (
              chats.map((chat) => (
                <ListItem
                  button
                  key={chat.id}
                  onClick={() => {
                    handleClickChat(chat);
                    handleClose();
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2">
                          {chat.title}
                        </Typography>
                        {chat.unreadMessages > 0 && (
                          <Badge
                            badgeContent={chat.unreadMessages}
                            color="secondary"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        noWrap
                      >
                        {chat.lastMessage}
                      </Typography>
                    }
                  />
                </ListItem>
              ))
            )}
          </List>
        </Box>
      </Popover>
    </div>
  );
};

export default ChatPopover;
