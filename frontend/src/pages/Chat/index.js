import React, { useContext, useEffect, useRef, useState } from "react";
import { styled } from '@mui/material/styles';
import {
  Box,
  Grid,
  Paper,
  Hidden,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  TextField,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ChatList from "./ChatList";
import ChatMessages from "./ChatMessages";
import { UsersFilter } from "../../components/UsersFilter";
import api from "../../services/api";
import { socketConnection } from "../../services/socket";
import { has, isObject } from "lodash";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";
import { useDate } from "../../hooks/useDate";
import toastError from "../../errors/toastError";

const MainContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: theme.palette.background.default,
  display: "flex",
  height: "100%",
}));

const ChatContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  height: "100%",
  width: "100%",
  position: "relative",
  overflow: "hidden",
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  height: "100%",
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
}));

export function ChatModal({
  open,
  chat,
  type,
  handleClose,
  handleLoadNewChat,
}) {
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    setTitle("");
    setUsers([]);
    if (type === "edit") {
      const userList = chat.users.map((u) => ({
        id: u.user.id,
        name: u.user.name,
      }));
      setUsers(userList);
      setTitle(chat.title);
    }
  }, [chat, open, type]);

  const handleSave = async () => {
    try {
      if (!title) {
        alert("Por favor, preencha o título da conversa.");
        return;
      }

      if (!users || users.length === 0) {
        alert("Por favor, selecione pelo menos um usuário.");
        return;
      }

      if (type === "edit") {
        await api.put(`/chats/${chat.id}`, {
          users,
          title,
        });
      } else {
        const { data } = await api.post("/chats", {
          users,
          title,
        });
        handleLoadNewChat(data);
      }
      handleClose();
    } catch (err) {}
  };  

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Conversa</DialogTitle>
      <DialogContent>
        <Grid spacing={2} container>
          <Grid xs={12} style={{ padding: 18 }} item>
            <TextField
              label="Título"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
            />
          </Grid>
          <Grid xs={12} item>
            <UsersFilter
              onFiltered={(users) => setUsers(users)}
              initialUsers={users}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Fechar
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Chat(props) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const date = useDate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [showMessagesGrid, setShowMessagesGrid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [tab, setTab] = useState("open");
  const [contacts, setContacts] = useState([]);
  const [contactId, setContactId] = useState("");
  const [selectedContact, setSelectedContact] = useState({});
  const [contactsPage, setContactsPage] = useState(1);

  useEffect(() => {
    if (user && user.profile && user.profile !== "admin") {
      const companyId = localStorage.getItem("companyId");
      if (companyId && user.companyId !== companyId) {
        localStorage.removeItem("companyId");
        navigate("/");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, tab, pageNumber]);

  useEffect(() => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      setSelectedContact(contact);
    }
  }, [contactId, contacts]);

  const fetchContacts = async () => {
    try {
      const { data } = await api.get("/contacts", {
        params: { searchParam, pageNumber, tab },
      });
      setContacts(data.contacts);
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleSelectContact = (contact) => {
    setContactId(contact.id);
    setSelectedContact(contact);
    setShowMessagesGrid(true);
  };

  const handleCloseMessages = () => {
    setShowMessagesGrid(false);
    setContactId("");
  };

  const handleScroll = (e) => {
    if (!hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      setPageNumber(prevState => prevState + 1);
    }
  };

  const renderMessagesGrid = () => {
    return (
      <MessagesContainer>
        <ChatMessages
          contact={selectedContact}
          handleClose={handleCloseMessages}
        />
      </MessagesContainer>
    );
  };

  const renderContactList = () => {
    return (
      <ChatList
        contacts={contacts}
        loading={loading}
        handleSelectContact={handleSelectContact}
        hasMore={hasMore}
        handleScroll={handleScroll}
      />
    );
  };

  return (
    <MainContainer>
      <StyledPaper>
        <ChatContainer>
          {loading ? (
            <LoadingContainer>
              <CircularProgress />
            </LoadingContainer>
          ) : (
            <>
              {isDesktop ? (
                <Grid container>
                  <Grid item xs={4}>
                    {renderContactList()}
                  </Grid>
                  <Grid item xs={8}>
                    {renderMessagesGrid()}
                  </Grid>
                </Grid>
              ) : (
                <>
                  {showMessagesGrid ? (
                    renderMessagesGrid()
                  ) : (
                    renderContactList()
                  )}
                </>
              )}
            </>
          )}
        </ChatContainer>
      </StyledPaper>
    </MainContainer>
  );
}

export default Chat;
