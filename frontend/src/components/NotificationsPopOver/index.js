import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { socketConnection } from "../../services/socket";
import useSound from "use-sound";
import { styled } from '@mui/material/styles';
import Popover from '@mui/material/Popover';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Badge from '@mui/material/Badge';
import ChatIcon from '@mui/icons-material/Chat';
import Box from '@mui/material/Box';

import TicketListItem from "../TicketListItemCustom";
import useTickets from "../../hooks/useTickets";
import alertSound from "../../assets/sound.mp3";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";

const TabContainer = styled(Box)(({ theme }) => ({
	overflowY: "auto",
	maxHeight: 350,
	...theme.scrollbarStyles,
}));

const PopoverPaper = styled(Box)(({ theme }) => ({
	width: "100%",
	maxWidth: 350,
	marginLeft: theme.spacing(2),
	marginRight: theme.spacing(1),
	[theme.breakpoints.down("sm")]: {
		maxWidth: 270,
	},
}));

const NotificationsPopOver = (volume) => {
	const navigate = useNavigate();
	const { user } = useContext(AuthContext);
	const ticketIdUrl = +navigate.location.pathname.split("/")[2];
	const ticketIdRef = useRef(ticketIdUrl);
	const anchorEl = useRef();
	const [isOpen, setIsOpen] = useState(false);
	const [notifications, setNotifications] = useState([]);
	const [showPendingTickets, setShowPendingTickets] = useState(false);
	const [, setDesktopNotifications] = useState([]);
	const { tickets } = useTickets({ withUnreadMessages: "true" });
	const [play] = useSound(alertSound, volume);
	const soundAlertRef = useRef();
	const navigateRef = useRef(navigate);

	useEffect(() => {
		const fetchSettings = async () => {
			try {
				if (user.allTicket === "enable") {
					setShowPendingTickets(true);
				}
			} catch (err) {
				toastError(err);
			}
		}
		fetchSettings();
	}, []);

	useEffect(() => {
		soundAlertRef.current = play;

		if (!("Notification" in window)) {
			console.log("This browser doesn't support notifications");
		} else {
			Notification.requestPermission();
		}
	}, [play]);

	useEffect(() => {
		const processNotifications = () => {
			if (showPendingTickets) {
				setNotifications(tickets);
			} else {
				const newNotifications = tickets.filter(ticket => ticket.status !== "pending");
				setNotifications(newNotifications);
			}
		}
		processNotifications();
	}, [tickets]);

	useEffect(() => {
		ticketIdRef.current = ticketIdUrl;
	}, [ticketIdUrl]);

	useEffect(() => {
		const socket = socketConnection({companyId: user.companyId, userId: user.id});
		socket.on("connect", () => socket.emit("joinNotification"));

		socket.on(`company-${user.companyId}-ticket`, data => {
			if (data.action === "updateUnread" || data.action === "delete") {
				setNotifications(prevState => {
					const ticketIndex = prevState.findIndex(t => t.id === data.ticketId);
					if (ticketIndex !== -1) {
						prevState.splice(ticketIndex, 1);
						return [...prevState];
					}
					return prevState;
				});

				setDesktopNotifications(prevState => {
					const notfiticationIndex = prevState.findIndex(
						n => n.tag === String(data.ticketId)
					);
					if (notfiticationIndex !== -1) {
						prevState[notfiticationIndex].close();
						prevState.splice(notfiticationIndex, 1);
						return [...prevState];
					}
					return prevState;
				});
			}
		});

		socket.on(`company-${user.companyId}-appMessage`, data => {
			if (
				data.action === "create" && !data.message.fromMe && 
				(data.ticket.status !== "pending" ) &&
				(!data.message.read || data.ticket.status === "pending") &&
				(data.ticket.userId === user?.id || !data.ticket.userId) &&
				(user?.queues?.some(queue => (queue.id === data.ticket.queueId)) || !data.ticket.queueId)
			) {
				setNotifications(prevState => {
					const ticketIndex = prevState.findIndex(t => t.id === data.ticket.id);
					if (ticketIndex !== -1) {
						prevState[ticketIndex] = data.ticket;
						return [...prevState];
					}
					return [data.ticket, ...prevState];
				});

				const shouldNotNotificate =
					(data.message.ticketId === ticketIdRef.current &&
						document.visibilityState === "visible") ||
					(data.ticket.userId && data.ticket.userId !== user?.id) ||
					data.ticket.isGroup;

				if (shouldNotNotificate) return;

				handleNotifications(data);
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [user, showPendingTickets]);

	const handleNotifications = data => {
		const { message, contact, ticket } = data;

		const options = {
			body: `${message.body} - ${format(new Date(), "HH:mm")}`,
			icon: contact.urlPicture,
			tag: ticket.id,
			renotify: true,
		};

		const notification = new Notification(
			`${i18n.t("tickets.notification.message")} ${contact.name}`,
			options
		);

		notification.onclick = e => {
			e.preventDefault();
			window.focus();
			navigateRef.current.push(`/tickets/${ticket.uuid}`);
		};

		setDesktopNotifications(prevState => {
			const notfiticationIndex = prevState.findIndex(
				n => n.tag === notification.tag
			);
			if (notfiticationIndex !== -1) {
				prevState[notfiticationIndex] = notification;
				return [...prevState];
			}
			return [notification, ...prevState];
		});

		soundAlertRef.current();
	};

	const handleClick = () => {
		setIsOpen(prevState => !prevState);
	};

	const handleClickAway = () => {
		setIsOpen(false);
	};

	const NotificationTicket = ({ children }) => {
		return <div onClick={handleClickAway}>{children}</div>;
	};

	const handleNotificationClick = (notification) => {
		if (notification.ticketId) {
			navigate(`/tickets/${notification.ticketId}`);
		}
	};

	return (
		<>
			<IconButton
				onClick={handleClick}
				ref={anchorEl}
				aria-label="Open Notifications"
				color="inherit"
				sx={{ color: "white" }}
			>
				<Badge overlap="rectangular" badgeContent={notifications.length} color="secondary">
					<ChatIcon />
				</Badge>
			</IconButton>
			<Popover
				disableScrollLock
				open={isOpen}
				anchorEl={anchorEl.current}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				onClose={handleClickAway}
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
				<List dense component={TabContainer}>
					{notifications.length === 0 ? (
						<ListItem>
							<ListItemText primary={i18n.t("notifications.noTickets")} />
						</ListItem>
					) : (
						notifications.map(ticket => (
							<NotificationTicket key={ticket.id}>
								<TicketListItem ticket={ticket} />
							</NotificationTicket>
						))
					)}
				</List>
			</Popover>
		</>
	);
};

export default NotificationsPopOver;
