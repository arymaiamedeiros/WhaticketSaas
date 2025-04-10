import React, { useState, useEffect, useContext } from "react";
import { styled } from '@mui/material/styles';
import {
	Button,
	TextField,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Autocomplete,
	CircularProgress,
	Grid,
	ListItemText,
	MenuItem,
	Select,
	Typography,
	Box
} from "@mui/material";
import { WhatsApp } from "@mui/icons-material";
import { toast } from "react-toastify";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ContactModal from "../ContactModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";

const OnlineStatus = styled(Typography)(({ theme }) => ({
	fontSize: 11,
	color: "#25d366"
}));

const OfflineStatus = styled(Typography)(({ theme }) => ({
	fontSize: 11,
	color: "#e1306c"
}));

const filter = createFilterOptions({
	trim: true,
});

const NewTicketModal = ({ modalOpen, onClose, initialContact }) => {
	const [options, setOptions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchParam, setSearchParam] = useState("");
	const [selectedContact, setSelectedContact] = useState(null);
	const [selectedQueue, setSelectedQueue] = useState("");
	const [selectedWhatsapp, setSelectedWhatsapp] = useState("");
	const [newContact, setNewContact] = useState({});
	const [whatsapps, setWhatsapps] = useState([]);
	const [contactModalOpen, setContactModalOpen] = useState(false);
	const { user } = useContext(AuthContext);
	const { companyId, whatsappId } = user;

	const [openAlert, setOpenAlert] = useState(false);
	const [userTicketOpen, setUserTicketOpen] = useState("");
	const [queueTicketOpen, setQueueTicketOpen] = useState("");

	useEffect(() => {
		if (initialContact?.id !== undefined) {
			setOptions([initialContact]);
			setSelectedContact(initialContact);
		}
	}, [initialContact]);

	useEffect(() => {
		setLoading(true);
		const delayDebounceFn = setTimeout(() => {
			const fetchContacts = async () => {
				api
					.get(`/whatsapp`, { params: { companyId, session: 0 } })
					.then(({ data }) => setWhatsapps(data));
			};

			if (whatsappId !== null && whatsappId !== undefined) {
				setSelectedWhatsapp(whatsappId)
			}

			if (user.queues.length === 1) {
				setSelectedQueue(user.queues[0].id)
			}
			fetchContacts();
			setLoading(false);
		}, 500);
		return () => clearTimeout(delayDebounceFn);
	}, [])

	useEffect(() => {
		if (!modalOpen || searchParam.length < 3) {
			setLoading(false);
			return;
		}
		setLoading(true);
		const delayDebounceFn = setTimeout(() => {
			const fetchContacts = async () => {
				try {
					const { data } = await api.get("contacts", {
						params: { searchParam },
					});
					setOptions(data.contacts);
					setLoading(false);
				} catch (err) {
					setLoading(false);
					toastError(err);
				}
			};
			fetchContacts();
		}, 500);
		return () => clearTimeout(delayDebounceFn);
	}, [searchParam, modalOpen]);

	const handleClose = () => {
		onClose();
		setSearchParam("");
		setOpenAlert(false);
		setUserTicketOpen("");
		setQueueTicketOpen("");
		setSelectedContact(null);
	};

	const handleCloseAlert = () => {
		setOpenAlert(false);
		setLoading(false);
		setOpenAlert(false);
		setUserTicketOpen("");
		setQueueTicketOpen("");
	};

	const handleSaveTicket = async contactId => {
		if (!contactId) return;
		if (selectedQueue === "" && user.profile !== 'admin') {
			toast.error("Selecione uma fila");
			return;
		}

		setLoading(true);
		try {
			const queueId = selectedQueue !== "" ? selectedQueue : null;
			const whatsappId = selectedWhatsapp !== "" ? selectedWhatsapp : null;
			const { data: ticket } = await api.post("/tickets", {
				contactId: contactId,
				queueId,
				whatsappId,
				userId: user.id,
				status: "open",
			});

			onClose(ticket);
		} catch (err) {
			const ticket = JSON.parse(err.response.data.error);

			if (ticket.userId !== user?.id) {
				setOpenAlert(true);
				setUserTicketOpen(ticket.user.name);
				setQueueTicketOpen(ticket.queue.name);
			} else {
				setOpenAlert(false);
				setUserTicketOpen("");
				setQueueTicketOpen("");
				setLoading(false);
				onClose(ticket);
			}
		}
		setLoading(false);
	};

	const handleSelectOption = (e, newValue) => {
		if (newValue?.number) {
			setSelectedContact(newValue);
		} else if (newValue?.name) {
			setNewContact({ name: newValue.name });
			setContactModalOpen(true);
		}
	};

	const handleCloseContactModal = () => {
		setContactModalOpen(false);
	};

	const handleAddNewContactTicket = contact => {
		handleSaveTicket(contact.id);
	};

	const createAddContactOption = (filterOptions, params) => {
		const filtered = filter(filterOptions, params);
		if (params.inputValue !== "" && !loading && searchParam.length >= 3) {
			filtered.push({
				name: `${params.inputValue}`,
			});
		}
		return filtered;
	};

	const renderOption = option => {
		if (option.number) {
			return <>
				<Typography component="span" sx={{ fontSize: 14, ml: "10px", display: "inline-flex", alignItems: "center", lineHeight: "2" }}>
					{option.name} - {option.number}
				</Typography>
			</>
		} else {
			return `${i18n.t("newTicketModal.add")} ${option.name}`;
		}
	};

	const renderOptionLabel = option => {
		if (option.number) {
			return `${option.name} - ${option.number}`;
		} else {
			return `${option.name}`;
		}
	};

	const renderContactAutocomplete = () => {
		if (initialContact === undefined || initialContact.id === undefined) {
			return (
				<Grid item xs={12}>
					<Autocomplete
						fullWidth
						options={options}
						loading={loading}
						clearOnBlur
						autoHighlight
						freeSolo
						clearOnEscape
						getOptionLabel={renderOptionLabel}
						renderOption={renderOption}
						filterOptions={createAddContactOption}
						onChange={(e, newValue) => handleSelectOption(e, newValue)}
						renderInput={params => (
							<TextField
								{...params}
								label={i18n.t("newTicketModal.fieldLabel")}
								variant="outlined"
								required
								autoFocus
								onChange={e => setSearchParam(e.target.value)}
								InputProps={{
									...params.InputProps,
									endAdornment: (
										<>
											{loading ? <CircularProgress color="inherit" size={20} /> : null}
											{params.InputProps.endAdornment}
										</>
									),
								}}
							/>
						)}
					/>
				</Grid>
			);
		} else {
			return null;
		}
	};

	return (
		<>
			<Dialog open={modalOpen} onClose={handleClose} maxWidth="lg" scroll="paper">
				<DialogTitle id="form-dialog-title">
					{i18n.t("newTicketModal.title")}
				</DialogTitle>
				<DialogContent dividers>
					<Grid container spacing={2}>
						{renderContactAutocomplete()}
						{user.queues.length > 1 && (
							<Grid item xs={12}>
								<Select
									fullWidth
									displayEmpty
									variant="outlined"
									value={selectedQueue}
									onChange={(e) => setSelectedQueue(e.target.value)}
									label={i18n.t("newTicketModal.queueLabel")}
								>
									<MenuItem value={""}>
										{i18n.t("newTicketModal.selectQueuePlaceholder")}
									</MenuItem>
									{user.queues.map((queue) => (
										<MenuItem key={queue.id} value={queue.id}>
											{queue.name}
										</MenuItem>
									))}
								</Select>
							</Grid>
						)}
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color="secondary">
						{i18n.t("newTicketModal.buttons.cancel")}
					</Button>
					<ButtonWithSpinner
						variant="contained"
						type="button"
						disabled={!selectedContact}
						onClick={() => handleSaveTicket(selectedContact.id)}
						loading={loading}
					>
						{i18n.t("newTicketModal.buttons.ok")}
					</ButtonWithSpinner>
				</DialogActions>
			</Dialog>
			<ContactModal
				open={contactModalOpen}
				onClose={handleCloseContactModal}
				contact={newContact}
				onSave={handleAddNewContactTicket}
			/>
		</>
	);
};

export default NewTicketModal;
