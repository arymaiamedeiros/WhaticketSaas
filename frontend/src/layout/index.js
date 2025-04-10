import React, { useState, useContext, useEffect } from "react";
import { styled, useTheme } from '@mui/material/styles';
import {
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  MenuItem,
  IconButton,
  Menu,
  useMediaQuery,
  Box
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AccountCircle as AccountCircleIcon,
  Cached as CachedIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Notifications as NotificationsIcon,
  VolumeUp as VolumeUpIcon,
  Chat as ChatIcon,
  Announcement as AnnouncementIcon
} from '@mui/icons-material';

import MainListItems from "./MainListItems";
import NotificationsPopOver from "../components/NotificationsPopOver";
import NotificationsVolume from "../components/NotificationsVolume";
import UserModal from "../components/UserModal";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";
import { i18n } from "../translate/i18n";
import toastError from "../errors/toastError";
import AnnouncementsPopover from "../components/AnnouncementsPopover";
import logo from "../assets/logo.png";
import logoWhite from "../assets/logo_branca.png";
import { socketConnection } from "../services/socket";
import ChatPopover from "../pages/Chat/ChatPopover";
import { useDate } from "../hooks/useDate";
import ColorModeContext from "../layout/themeContext";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { TicketsContext } from "../context/Tickets/TicketsContext";
import { Can } from "../components/Can";
import api from "../services/api";

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const MainDrawer = styled(Drawer)({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

const Root = styled('div')(({ theme }) => ({
  display: "flex",
  height: "100vh",
  [theme.breakpoints.down("sm")]: {
    height: "calc(100vh - 56px)",
  },
  backgroundColor: theme.palette.fancyBackground,
  '& .MuiButton-outlinedPrimary': {
    color: theme.mode === 'light' ? '#FFF' : '#FFF',
    backgroundColor: theme.mode === 'light' ? '#1380D6' : '#1c1c1c',
  },
  '& .MuiTab-textColorPrimary.Mui-selected': {
    color: theme.mode === 'light' ? '#1380D6' : '#FFF',
  }
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  paddingRight: 24,
  color: theme.palette.dark.main,
  background: theme.palette.barraSuperior,
}));

const StyledToolbarIcon = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 8px",
  minHeight: "48px",
  [theme.breakpoints.down("sm")]: {
    height: "48px"
  }
}));

const Logo = styled('img')(({ theme }) => ({
  width: "80%",
  height: "auto",
  maxWidth: 180,
  [theme.breakpoints.down("sm")]: {
    width: "auto",
    height: "80%",
    maxWidth: 180,
  },
}));

const Layout = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [volumeAnchorEl, setVolumeAnchorEl] = useState(null);
  const [announcementsAnchorEl, setAnnouncementsAnchorEl] = useState(null);
  const [chatAnchorEl, setChatAnchorEl] = useState(null);
  const [connectionWarning, setConnectionWarning] = useState(false);

  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { user, handleLogout } = useContext(AuthContext);
  const { whatsApps } = useContext(WhatsAppsContext);
  const { tickets } = useContext(TicketsContext);

  const { colorMode } = useContext(ColorModeContext);
  const greaterThenSm = useMediaQuery(theme.breakpoints.up("sm"));

  const [volume, setVolume] = useState(localStorage.getItem("volume") || 1);

  const { dateToClient } = useDate();

  useEffect(() => {
    if (isMobile) {
      setDrawerOpen(false);
    } else {
      setDrawerOpen(true);
    }
  }, [isMobile]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (connectionWarning) {
        setShowBackdrop(false);
        setConnectionWarning(false);
        toast.success(i18n.t("connections.connected"));
      }
    }, 4000);

    return () => clearTimeout(delayDebounceFn);
  }, [connectionWarning]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const userId = localStorage.getItem("userId");

    const socket = socketConnection({ companyId });

    socket.on(`company-${companyId}-auth`, (data) => {
      if (data.user.id === +userId) {
        toastError("Sua conta foi acessada em outro computador.");
        setTimeout(() => {
          localStorage.clear();
          window.location.reload();
        }, 1000);
      }
    });
    socket.emit("userStatus");
    const interval = setInterval(() => {
      socket.emit("userStatus");
    }, 1000 * 60 * 5);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsMenuOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsMenuClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleVolumeMenuOpen = (event) => {
    setVolumeAnchorEl(event.currentTarget);
  };

  const handleVolumeMenuClose = () => {
    setVolumeAnchorEl(null);
  };

  const handleAnnouncementsClick = (event) => {
    setAnnouncementsAnchorEl(event.currentTarget);
  };

  const handleChatClick = (event) => {
    setChatAnchorEl(event.currentTarget);
  };

  const handleLogoutClick = async () => {
    try {
      await api.post("/auth/logout");
      handleLogout();
    } catch (err) {
      toastError(err);
    }
  };

  const handleProfileClick = () => {
    handleUserMenuClose();
    history.push("/profile");
  };

  const handleUserModalOpen = () => {
    setUserModalOpen(true);
    handleUserMenuClose();
  };

  const handleUserModalClose = () => {
    setUserModalOpen(false);
  };

  const filteredWhatsApps = whatsApps.filter((whatsApp) => {
    if (whatsApp.status === "CONNECTED") return true;
    if (
      user.profile.toUpperCase() === "ADMIN" ||
      user.profile.toUpperCase() === "SUPERVISOR"
    )
      return true;
    const userWhatsappIds = user.queues.map((q) => q.whatsappId);
    return userWhatsappIds.includes(whatsApp.id);
  });

  const notificationsCount = tickets.filter((t) => t.isGroup === false).length;

  const toggleColorMode = () => {
    colorMode.toggleColorMode();
  };

  return (
    <Root>
      <BackdropLoading open={showBackdrop} />
      <AppBarStyled position="fixed" open={drawerOpen}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(drawerOpen && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {i18n.t("layout.appName")}
          </Typography>
          <IconButton color="inherit" onClick={toggleColorMode}>
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <IconButton color="inherit" onClick={handleDrawerClose}>
            <CachedIcon />
          </IconButton>
          <Can
            role={user.profile}
            perform="drawer-whatsapp-items:view"
            yes={() => (
              <IconButton
                color="inherit"
                onClick={handleVolumeMenuOpen}
                disabled={filteredWhatsApps.length === 0}
              >
                <VolumeUpIcon />
              </IconButton>
            )}
          />
          <IconButton color="inherit" onClick={handleAnnouncementsClick}>
            <AnnouncementIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleChatClick}>
            <ChatIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={handleNotificationsMenuOpen}
            disabled={notificationsCount === 0}
          >
            <NotificationsIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleUserMenuOpen}>
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
      </AppBarStyled>
      <MainDrawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <MainListItems />
        </List>
      </MainDrawer>
      <Main open={drawerOpen}>
        <DrawerHeader />
        {children}
      </Main>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(anchorEl)}
        onClose={handleUserMenuClose}
      >
        <MenuItem onClick={handleProfileClick}>
          {i18n.t("mainDrawer.appBar.user.profile")}
        </MenuItem>
        <MenuItem onClick={handleUserModalOpen}>
          {i18n.t("mainDrawer.appBar.user.settings")}
        </MenuItem>
        <MenuItem onClick={handleLogoutClick}>
          {i18n.t("mainDrawer.appBar.user.logout")}
        </MenuItem>
      </Menu>
      <NotificationsPopOver
        anchorEl={notificationsAnchorEl}
        handleClose={handleNotificationsMenuClose}
      />
      <NotificationsVolume
        anchorEl={volumeAnchorEl}
        handleClose={handleVolumeMenuClose}
      />
      <AnnouncementsPopover
        anchorEl={announcementsAnchorEl}
        handleClose={() => setAnnouncementsAnchorEl(null)}
      />
      <ChatPopover
        anchorEl={chatAnchorEl}
        handleClose={() => setChatAnchorEl(null)}
      />
      <UserModal
        open={userModalOpen}
        onClose={handleUserModalClose}
        userId={user?.id}
      />
    </Root>
  );
};

export default Layout;
