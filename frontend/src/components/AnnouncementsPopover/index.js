import React, { useEffect, useReducer, useState } from "react";
import { styled } from '@mui/material/styles';
import toastError from "../../errors/toastError";
import Popover from "@mui/material/Popover";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Dialog from "@mui/material/Dialog";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import DialogContentText from "@mui/material/DialogContentText";

import api from "../../services/api";
import { isArray } from "lodash";
import moment from "moment";
import { socketConnection } from "../../services/socket";

const MainPaper = styled(Paper)(({ theme }) => ({
    flex: 1,
    maxHeight: 3000,
    maxWidth: 5000,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
}));

const MediaContainer = styled('div')({
    border: "1px solid #f1f1f1",
    margin: "0 auto 20px",
    textAlign: "center",
    width: "400px",
    height: 300,
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain",
    backgroundPosition: "center",
});

function AnnouncementDialog({ announcement, open, handleClose }) {
    const getMediaPath = (filename) => {
        return `${process.env.REACT_APP_BACKEND_URL}/public/${filename}`;
    };

    return (
        <Dialog
            open={open}
            onClose={() => handleClose()}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{announcement.title}</DialogTitle>
            <DialogContent>
                {announcement.mediaPath && (
                    <MediaContainer
                        style={{
                            backgroundImage: `url(${getMediaPath(announcement.mediaPath)})`,
                        }}
                    />
                )}
                <DialogContentText id="alert-dialog-description">
                    {announcement.text}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleClose()} color="primary" autoFocus>
                    Fechar
                </Button>
            </DialogActions>
        </Dialog>
    );
}

const reducer = (state, action) => {
    if (action.type === "LOAD_ANNOUNCEMENTS") {
        const announcements = action.payload;
        const newAnnouncements = [];

        if (isArray(announcements)) {
            announcements.forEach((announcement) => {
                const announcementIndex = state.findIndex(
                    (u) => u.id === announcement.id
                );
                if (announcementIndex !== -1) {
                    state[announcementIndex] = announcement;
                } else {
                    newAnnouncements.push(announcement);
                }
            });
        }

        return [...state, ...newAnnouncements];
    }

    if (action.type === "UPDATE_ANNOUNCEMENTS") {
        const announcement = action.payload;
        const announcementIndex = state.findIndex((u) => u.id === announcement.id);

        if (announcementIndex !== -1) {
            state[announcementIndex] = announcement;
            return [...state];
        } else {
            return [announcement, ...state];
        }
    }

    if (action.type === "DELETE_ANNOUNCEMENT") {
        const announcementId = action.payload;

        const announcementIndex = state.findIndex((u) => u.id === announcementId);
        if (announcementIndex !== -1) {
            state.splice(announcementIndex, 1);
        }
        return [...state];
    }

    if (action.type === "RESET") {
        return [];
    }
};

export default function AnnouncementsPopover() {
    const [loading, setLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [searchParam] = useState("");
    const [announcements, dispatch] = useReducer(reducer, []);
    const [invisible, setInvisible] = useState(false);
    const [announcement, setAnnouncement] = useState({});
    const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);

    useEffect(() => {
        dispatch({ type: "RESET" });
        setPageNumber(1);
    }, [searchParam]);

    useEffect(() => {
        setLoading(true);
        const delayDebounceFn = setTimeout(() => {
            fetchAnnouncements();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchParam, pageNumber]);

    useEffect(() => {
        const companyId = localStorage.getItem("companyId");
        const socket = socketConnection({ companyId });

        socket.on(`company-announcement`, (data) => {
            if (data.action === "update" || data.action === "create") {
                dispatch({ type: "UPDATE_ANNOUNCEMENTS", payload: data.record });
                setInvisible(false);
            }
            if (data.action === "delete") {
                dispatch({ type: "DELETE_ANNOUNCEMENT", payload: +data.id });
            }
        });
        return () => {
            socket.disconnect();
        };
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const { data } = await api.get("/announcements/", {
                params: { searchParam, pageNumber },
            });
            dispatch({ type: "LOAD_ANNOUNCEMENTS", payload: data.records });
            setHasMore(data.hasMore);
            setLoading(false);
        } catch (err) {
            toastError(err);
        }
    };

    const loadMore = () => {
        setPageNumber((prevState) => prevState + 1);
    };

    const handleScroll = (e) => {
        if (!hasMore || loading) return;
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - (scrollTop + 100) < clientHeight) {
            loadMore();
        }
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        setInvisible(true);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const borderPriority = (priority) => {
        if (priority === 1) {
            return "4px solid #b81111";
        }
        if (priority === 2) {
            return "4px solid orange";
        }
        if (priority === 3) {
            return "4px solid grey";
        }
    };

    const getMediaPath = (filename) => {
        return `${process.env.REACT_APP_BACKEND_URL}/public/${filename}`;
    };

    const handleShowAnnouncementDialog = (record) => {
        setAnnouncement(record);
        setShowAnnouncementDialog(true);
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;

    return (
        <div>
            <AnnouncementDialog
                announcement={announcement}
                open={showAnnouncementDialog}
                handleClose={() => setShowAnnouncementDialog(false)}
            />
            <IconButton
                aria-describedby={id}
                onClick={handleClick}
                sx={{ color: "white" }}
            >
                <Badge
                    color="secondary"
                    variant="dot"
                    invisible={invisible || announcements.length < 1}
                >
                    <AnnouncementIcon />
                </Badge>
            </IconButton>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                PaperProps={{
                    sx: {
                        width: "100%",
                        maxWidth: 350,
                        ml: 2,
                        mr: 1,
                        '@media (max-width: 600px)': {
                            maxWidth: 270,
                        }
                    }
                }}
            >
                <MainPaper onScroll={handleScroll}>
                    <List>
                        {announcements.map((announcement) => (
                            <ListItem
                                key={announcement.id}
                                sx={{
                                    borderLeft: borderPriority(announcement.priority),
                                    cursor: "pointer",
                                }}
                                onClick={() => handleShowAnnouncementDialog(announcement)}
                            >
                                <ListItemAvatar>
                                    <Avatar>
                                        <NotificationsIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={announcement.title}
                                    secondary={
                                        <>
                                            <Typography component="span" variant="body2">
                                                {announcement.text}
                                            </Typography>
                                            <br />
                                            <Typography component="span" variant="body2" color="textSecondary">
                                                {moment(announcement.createdAt).format("DD/MM/YY HH:mm")}
                                            </Typography>
                                        </>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </MainPaper>
            </Popover>
        </div>
    );
}
