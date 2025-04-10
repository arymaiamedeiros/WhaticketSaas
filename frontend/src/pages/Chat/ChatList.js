import React, { useContext, useState } from "react";
import { styled } from '@mui/material/styles';
import {
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  ListItemAvatar,
  Avatar,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Box,
  ListItemSecondaryAction
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { green } from '@mui/material/colors';
import { useHistory, useParams } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";
import { i18n } from "../../translate/i18n";
import ConfirmationModal from "../../components/ConfirmationModal";
import api from "../../services/api";

const MainContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  position: "relative",
  flex: 1,
  height: "calc(100% - 58px)",
  overflow: "hidden",
  borderRadius: 0,
  backgroundColor: theme.palette.boxlist,
}));

const ChatListContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  position: "relative",
  flex: 1,
  overflowY: "scroll",
  ...theme.scrollbarStyles,
}));

const ListContainer = styled(Paper)(({ theme }) => ({
  flex: 1,
  maxHeight: "100%",
  overflowY: "scroll",
  ...theme.scrollbarStyles,
}));

const SearchContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(1, 2),
  background: theme.palette.background.default,
}));

const TabsContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(1, 2),
  background: theme.palette.background.paper,
}));

const ContactNameContainer = styled('div')({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const MessageText = styled(Typography)({
  maxWidth: 200,
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

const OnlineStatus = styled('div')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: green[600],
  marginRight: theme.spacing(1),
}));

const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
  cursor: "pointer",
  borderLeft: selected ? "6px solid #002d6e" : "none",
  backgroundColor: selected ? theme.palette.chatlist : "transparent",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

export default function ChatList({
  chats,
  handleSelectChat,
  handleDeleteChat,
  handleEditChat,
  pageInfo,
  loading,
}) {
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { datetimeToClient } = useDate();

  const [confirmationModal, setConfirmModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState({});

  const { id } = useParams();

  const goToMessages = async (chat) => {
    if (unreadMessages(chat) > 0) {
      try {
        await api.post(`/chats/${chat.id}/read`, { userId: user.id });
      } catch (err) {}
    }

    if (id !== chat.uuid) {
      history.push(`/chats/${chat.uuid}`);
      handleSelectChat(chat);
    }
  };

  const handleDelete = () => {
    handleDeleteChat(selectedChat);
  };

  const unreadMessages = (chat) => {
    const currentUser = chat.users.find((u) => u.userId === user.id);
    return currentUser.unreads;
  };

  const getPrimaryText = (chat) => {
    const mainText = chat.title;
    const unreads = unreadMessages(chat);
    return (
      <>
        {mainText}
        {unreads > 0 && (
          <Chip
            size="small"
            style={{ marginLeft: 5 }}
            label={unreads}
            color="secondary"
          />
        )}
      </>
    );
  };

  const getSecondaryText = (chat) => {
    return chat.lastMessage !== ""
      ? `${datetimeToClient(chat.updatedAt)}: ${chat.lastMessage}`
      : "";
  };

  const handleChangeTab = (event, newValue) => {
    // Implementation of handleChangeTab function
  };

  const handleSearch = (event) => {
    // Implementation of handleSearch function
  };

  const handleClearSearch = () => {
    // Implementation of handleClearSearch function
  };

  return (
    <>
      <ConfirmationModal
        title={"Excluir Conversa"}
        open={confirmationModal}
        onClose={setConfirmModalOpen}
        onConfirm={handleDelete}
      >
        Esta ação não pode ser revertida, confirmar?
      </ConfirmationModal>
      <MainContainer>
        <ChatListContainer>
          <List>
            {Array.isArray(chats) &&
              chats.length > 0 &&
              chats.map((chat, key) => (
                <StyledListItem
                  onClick={() => goToMessages(chat)}
                  key={key}
                  selected={chat.uuid === id}
                >
                  <ListItemText
                    primary={getPrimaryText(chat)}
                    secondary={getSecondaryText(chat)}
                  />
                  {chat.ownerId === user.id && (
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={() => {
                          goToMessages(chat).then(() => {
                            handleEditChat(chat);
                          });
                        }}
                        edge="end"
                        aria-label="delete"
                        size="small"
                        style={{ marginRight: 5 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          setSelectedChat(chat);
                          setConfirmModalOpen(true);
                        }}
                        edge="end"
                        aria-label="delete"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </StyledListItem>
              ))}
          </List>
        </ChatListContainer>
      </MainContainer>
    </>
  );
}
