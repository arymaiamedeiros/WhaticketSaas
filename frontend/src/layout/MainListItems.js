import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useHistory, useLocation } from "react-router-dom";
import { styled } from '@mui/material/styles';
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  List,
  Badge
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Queue as QueueIcon,
  Tag as TagIcon,
  Message as MessageIcon,
  ContactMail as ContactMailIcon,
  ContactPhone as ContactPhoneIcon,
  ContactSupport as ContactSupportIcon,
  ContactEmergency as ContactEmergencyIcon,
  ContactPage as ContactPageIcon,
  ContactMailOutline as ContactMailOutlineIcon,
  ContactPhoneOutline as ContactPhoneOutlineIcon,
  ContactSupportOutline as ContactSupportOutlineIcon,
  ContactEmergencyOutline as ContactEmergencyOutlineIcon,
  ContactPageOutline as ContactPageOutlineIcon,
  QueueOutline as QueueOutlineIcon,
  TagOutline as TagOutlineIcon,
  MessageOutline as MessageOutlineIcon,
  DashboardOutline as DashboardOutlineIcon,
  SettingsOutline as SettingsOutlineIcon,
  PeopleOutline as PeopleOutlineIcon
} from "@mui/icons-material";
import { Can } from "../components/Can";
import { AuthContext } from "../context/Auth/AuthContext";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { i18n } from "../translate/i18n";
import { socketConnection } from "../services/socket";
import { isArray } from "lodash";
import api from "../services/api";
import toastError from "../errors/toastError";
import usePlans from "../hooks/usePlans";

const StyledListItem = styled(ListItem)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: theme.spacing(4),
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  '& .MuiListItemText-primary': {
    fontSize: theme.typography.body2.fontSize,
  },
}));

const StyledCollapse = styled(Collapse)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
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

const MainListItems = (props) => {
  const { drawerClose, collapsed } = props;
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user, handleLogout } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showSchedules, setShowSchedules] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);
  const location = useLocation();

  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const { getPlanCompany } = usePlans();

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);

      setShowCampaigns(planConfigs.plan.useCampaigns);
      setShowKanban(planConfigs.plan.useKanban);
      setShowOpenAi(planConfigs.plan.useOpenAi);
      setShowIntegrations(planConfigs.plan.useIntegrations);
      setShowSchedules(planConfigs.plan.useSchedules);
      setShowInternalChat(planConfigs.plan.useInternalChat);
      setShowExternalApi(planConfigs.plan.useExternalApi);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketConnection({ companyId });

    socket.on(`company-${companyId}-chat`, (data) => {
      if (data.action === "new-message") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
      if (data.action === "update") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
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

  useEffect(() => {
    if (localStorage.getItem("cshow")) {
      setShowCampaigns(true);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  const handleClickLogout = () => {
    //handleCloseMenu();
    handleLogout();
  };

  return (
    <div onClick={drawerClose}>
      <Can
        role={user.profile}
        perform="drawer-dashboard-items:view"
        yes={() => (
          <StyledListItem
            button
            component={RouterLink}
            to="/"
            selected={location.pathname === "/"}
          >
            <StyledListItemIcon>
              <DashboardIcon />
            </StyledListItemIcon>
            <StyledListItemText primary={i18n.t("mainDrawer.listItems.dashboard")} />
          </StyledListItem>
        )}
      />

      <Can
        role={user.profile}
        perform="drawer-tickets-items:view"
        yes={() => (
          <StyledListItem
            button
            component={RouterLink}
            to="/tickets"
            selected={location.pathname === "/tickets"}
          >
            <StyledListItemIcon>
              <Badge badgeContent={chats.filter((t) => t.isGroup === false).length} color="secondary">
                <MessageIcon />
              </Badge>
            </StyledListItemIcon>
            <StyledListItemText primary={i18n.t("mainDrawer.listItems.tickets")} />
          </StyledListItem>
        )}
      />

      <Can
        role={user.profile}
        perform="drawer-queues-items:view"
        yes={() => (
          <StyledListItem
            button
            component={RouterLink}
            to="/queues"
            selected={location.pathname === "/queues"}
          >
            <StyledListItemIcon>
              <QueueIcon />
            </StyledListItemIcon>
            <StyledListItemText primary={i18n.t("mainDrawer.listItems.queues")} />
          </StyledListItem>
        )}
      />

      <Can
        role={user.profile}
        perform="drawer-tags-items:view"
        yes={() => (
          <StyledListItem
            button
            component={RouterLink}
            to="/tags"
            selected={location.pathname === "/tags"}
          >
            <StyledListItemIcon>
              <TagIcon />
            </StyledListItemIcon>
            <StyledListItemText primary={i18n.t("mainDrawer.listItems.tags")} />
          </StyledListItem>
        )}
      />

      <Can
        role={user.profile}
        perform="drawer-settings-items:view"
        yes={() => (
          <StyledListItem
            button
            component={RouterLink}
            to="/settings"
            selected={location.pathname === "/settings"}
          >
            <StyledListItemIcon>
              <SettingsIcon />
            </StyledListItemIcon>
            <StyledListItemText primary={i18n.t("mainDrawer.listItems.settings")} />
          </StyledListItem>
        )}
      />

      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <StyledListItem
              button
              onClick={() => setOpenCampaignSubmenu((prev) => !prev)}
            >
              <StyledListItemIcon>
                <ExpandLess />
                <ExpandMore />
              </StyledListItemIcon>
              <StyledListItemText primary={i18n.t("mainDrawer.listItems.campaigns")} />
            </StyledListItem>
            <StyledCollapse in={openCampaignSubmenu} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <StyledListItem onClick={() => history.push("/campaigns")} button>
                  <StyledListItemIcon>
                    <PeopleIcon />
                  </StyledListItemIcon>
                  <StyledListItemText primary="Listagem" />
                </StyledListItem>
                <StyledListItem
                  onClick={() => history.push("/contact-lists")}
                  button
                >
                  <StyledListItemIcon>
                    <PeopleIcon />
                  </StyledListItemIcon>
                  <StyledListItemText primary="Listas de Contatos" />
                </StyledListItem>
                <StyledListItem
                  onClick={() => history.push("/campaigns-config")}
                  button
                >
                  <StyledListItemIcon>
                    <SettingsIcon />
                  </StyledListItemIcon>
                  <StyledListItemText primary="Configurações" />
                </StyledListItem>
              </List>
            </StyledCollapse>
            {user.super && (
              <StyledListItem
                button
                component={RouterLink}
                to="/announcements"
              >
                <StyledListItemIcon>
                  <ExpandLess />
                  <ExpandMore />
                </StyledListItemIcon>
                <StyledListItemText primary={i18n.t("mainDrawer.listItems.annoucements")} />
              </StyledListItem>
            )}
            {showOpenAi && (
              <StyledListItem
                button
                component={RouterLink}
                to="/prompts"
              >
                <StyledListItemIcon>
                  <ExpandLess />
                  <ExpandMore />
                </StyledListItemIcon>
                <StyledListItemText primary={i18n.t("mainDrawer.listItems.prompts")} />
              </StyledListItem>
            )}

            {showIntegrations && (
              <StyledListItem
                button
                component={RouterLink}
                to="/queue-integration"
              >
                <StyledListItemIcon>
                  <ExpandLess />
                  <ExpandMore />
                </StyledListItemIcon>
                <StyledListItemText primary={i18n.t("mainDrawer.listItems.queueIntegration")} />
              </StyledListItem>
            )}
            <StyledListItem
              button
              component={RouterLink}
              to="/connections"
            >
              <StyledListItemIcon>
                <Badge badgeContent={connectionWarning ? "!" : 0} color="error">
                  <ExpandLess />
                  <ExpandMore />
                </Badge>
              </StyledListItemIcon>
              <StyledListItemText primary={i18n.t("mainDrawer.listItems.connections")} />
            </StyledListItem>
            <StyledListItem
              button
              component={RouterLink}
              to="/files"
            >
              <StyledListItemIcon>
                <ExpandLess />
                <ExpandMore />
              </StyledListItemIcon>
              <StyledListItemText primary={i18n.t("mainDrawer.listItems.files")} />
            </StyledListItem>
            <StyledListItem
              button
              component={RouterLink}
              to="/users"
            >
              <StyledListItemIcon>
                <ExpandLess />
                <ExpandMore />
              </StyledListItemIcon>
              <StyledListItemText primary={i18n.t("mainDrawer.listItems.users")} />
            </StyledListItem>
            {showExternalApi && (
              <StyledListItem
                button
                component={RouterLink}
                to="/messages-api"
              >
                <StyledListItemIcon>
                  <ExpandLess />
                  <ExpandMore />
                </StyledListItemIcon>
                <StyledListItemText primary={i18n.t("mainDrawer.listItems.messagesAPI")} />
              </StyledListItem>
            )}
            <StyledListItem
              button
              component={RouterLink}
              to="/financeiro"
            >
              <StyledListItemIcon>
                <ExpandLess />
                <ExpandMore />
              </StyledListItemIcon>
              <StyledListItemText primary={i18n.t("mainDrawer.listItems.financeiro")} />
            </StyledListItem>
          </>
        )}
      />
    </div>
  );
};

export default MainListItems;
