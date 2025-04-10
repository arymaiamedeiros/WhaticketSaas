import React, { useState, useEffect, useContext, useRef } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { styled } from '@mui/material/styles';
import { green } from '@mui/material/colors';
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Autocomplete from "@mui/material/Autocomplete";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import AttachFile from "@mui/icons-material/AttachFile";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import moment from "moment";
import { AuthContext } from "../../context/Auth/AuthContext";
import { isArray, capitalize, head } from "lodash";
import ConfirmationModal from "../ConfirmationModal";
import MessageVariablesPicker from "../MessageVariablesPicker";

const Root = styled('div')({
	display: "flex",
	flexWrap: "wrap",
});

const MultFieldLine = styled('div')(({ theme }) => ({
	display: "flex",
	"& > *:not(:last-child)": {
		marginRight: theme.spacing(1),
	},
}));

const ButtonWrapper = styled('div')({
	position: "relative",
});

const ButtonProgress = styled(CircularProgress)({
	color: green[500],
	position: "absolute",
	top: "50%",
	left: "50%",
	marginTop: -12,
	marginLeft: -12,
});

const StyledFormControl = styled(FormControl)(({ theme }) => ({
	margin: theme.spacing(1),
	minWidth: 120,
}));

const ScheduleSchema = Yup.object().shape({
	body: Yup.string()
		.min(5, "Mensagem muito curta")
		.required("Obrigatório"),
	contactId: Yup.number().required("Obrigatório"),
	sendAt: Yup.string().required("Obrigatório")
});

const ScheduleModal = ({ open, onClose, scheduleId, contactId, cleanContact, reload }) => {
	const history = useHistory();
	const { user } = useContext(AuthContext);

	const initialState = {
		body: "",
		contactId: "",
		sendAt: moment().add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
		sentAt: ""
	};

	const initialContact = {
		id: "",
		name: ""
	}

	const [schedule, setSchedule] = useState(initialState);
	const [currentContact, setCurrentContact] = useState(initialContact);
	const [contacts, setContacts] = useState([initialContact]);
	const [attachment, setAttachment] = useState(null);
	const attachmentFile = useRef(null);
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const messageInputRef = useRef();

	useEffect(() => {
		if (contactId && contacts.length) {
			const contact = contacts.find(c => c.id === contactId);
			if (contact) {
				setCurrentContact(contact);
			}
		}
	}, [contactId, contacts]);

	useEffect(() => {
		const { companyId } = user;
		if (open) {
			try {
				(async () => {
					const { data: contactList } = await api.get('/contacts/list', { params: { companyId: companyId } });
					let customList = contactList.map((c) => ({ id: c.id, name: c.name }));
					if (isArray(customList)) {
						setContacts([{ id: "", name: "" }, ...customList]);
					}
					if (contactId) {
						setSchedule(prevState => {
							return { ...prevState, contactId }
						});
					}

					if (!scheduleId) return;

					const { data } = await api.get(`/schedules/${scheduleId}`);
					setSchedule(prevState => {
						return { ...prevState, ...data, sendAt: moment(data.sendAt).format('YYYY-MM-DDTHH:mm') };
					});
					setCurrentContact(data.contact);
				})()
			} catch (err) {
				toastError(err);
			}
		}
	}, [scheduleId, contactId, open, user]);

	const handleClose = () => {
		onClose();
		setAttachment(null);
		setSchedule(initialState);
	};

	const handleAttachmentFile = (e) => {
		const file = head(e.target.files);
		if (file) {
			setAttachment(file);
		}
	};

	const handleSaveSchedule = async values => {
		const scheduleData = { ...values, userId: user.id };
		try {
			if (scheduleId) {
				await api.put(`/schedules/${scheduleId}`, scheduleData);
				if (attachment != null) {
					const formData = new FormData();
					formData.append("file", attachment);
					await api.post(
						`/schedules/${scheduleId}/media-upload`,
						formData
					);
				}
			} else {
				const { data } = await api.post("/schedules", scheduleData);
				if (attachment != null) {
					const formData = new FormData();
					formData.append("file", attachment);
					await api.post(`/schedules/${data.id}/media-upload`, formData);
				}
			}
			toast.success(i18n.t("scheduleModal.success"));
			if (typeof reload == 'function') {
				reload();
			}
			if (contactId) {
				if (typeof cleanContact === 'function') {
					cleanContact();
					history.push('/schedules');
				}
			}
		} catch (err) {
			toastError(err);
		}
		setCurrentContact(initialContact);
		setSchedule(initialState);
		handleClose();
	};

	const handleClickMsgVar = async (msgVar, setValueFunc) => {
		const el = messageInputRef.current;
		const firstHalfText = el.value.substring(0, el.selectionStart);
		const secondHalfText = el.value.substring(el.selectionEnd);
		const newCursorPos = el.selectionStart + msgVar.length;

		setValueFunc("body", `${firstHalfText}${msgVar}${secondHalfText}`);

		await new Promise(r => setTimeout(r, 100));
		messageInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
	};

	const deleteMedia = async () => {
		if (attachment) {
			setAttachment(null);
			attachmentFile.current.value = null;
		}

		if (schedule.mediaPath) {
			await api.delete(`/schedules/${schedule.id}/media-upload`);
			setSchedule((prev) => ({
				...prev,
				mediaPath: null,
			}));
			toast.success(i18n.t("scheduleModal.toasts.deleted"));
			if (typeof reload == "function") {
				reload();
			}
		}
	};

	return (
		<Root>
			<ConfirmationModal
				title={i18n.t("scheduleModal.confirmationModal.deleteTitle")}
				open={confirmationOpen}
				onClose={() => setConfirmationOpen(false)}
				onConfirm={deleteMedia}
			>
				{i18n.t("scheduleModal.confirmationModal.deleteMessage")}
			</ConfirmationModal>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="xs"
				fullWidth
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title">
					{schedule.status === 'ERRO' ? 'Erro de Envio' : `Mensagem ${capitalize(schedule.status)}`}
				</DialogTitle>
				<div style={{ display: "none" }}>
					<input
						type="file"
						accept=".png,.jpg,.jpeg"
						ref={attachmentFile}
						onChange={(e) => handleAttachmentFile(e)}
					/>
				</div>
				<Formik
					initialValues={schedule}
					enableReinitialize={true}
					validationSchema={ScheduleSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveSchedule(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ values, errors, touched, isSubmitting, setFieldValue }) => (
						<Form>
							<DialogContent dividers>
								<Grid container spacing={2}>
									<Grid item xs={12}>
										<Field
											as={TextField}
											label={i18n.t("scheduleModal.form.contact")}
											name="contactId"
											error={touched.contactId && Boolean(errors.contactId)}
											helperText={touched.contactId && errors.contactId}
											variant="outlined"
											margin="dense"
											fullWidth
											select
											SelectProps={{
												native: true,
											}}
										>
											{contacts.map((contact) => (
												<option key={contact.id} value={contact.id}>
													{contact.name}
												</option>
											))}
										</Field>
									</Grid>
									<Grid item xs={12}>
										<Field
											as={TextField}
											label={i18n.t("scheduleModal.form.sendAt")}
											name="sendAt"
											type="datetime-local"
											error={touched.sendAt && Boolean(errors.sendAt)}
											helperText={touched.sendAt && errors.sendAt}
											variant="outlined"
											margin="dense"
											fullWidth
											InputLabelProps={{
												shrink: true,
											}}
										/>
									</Grid>
									<Grid item xs={12}>
										<MultFieldLine>
											<Field
												as={TextField}
												label={i18n.t("scheduleModal.form.message")}
												name="body"
												error={touched.body && Boolean(errors.body)}
												helperText={touched.body && errors.body}
												variant="outlined"
												margin="dense"
												fullWidth
												multiline
												rows={4}
												inputRef={messageInputRef}
											/>
											<MessageVariablesPicker
												onSelect={(msgVar) => handleClickMsgVar(msgVar, setFieldValue)}
											/>
										</MultFieldLine>
									</Grid>
									<Grid item xs={12}>
										<MultFieldLine>
											<Button
												variant="outlined"
												color="primary"
												onClick={() => attachmentFile.current.click()}
												startIcon={<AttachFile />}
											>
												{i18n.t("scheduleModal.form.attach")}
											</Button>
											{(attachment || schedule.mediaPath) && (
												<Button
													variant="outlined"
													color="secondary"
													onClick={() => setConfirmationOpen(true)}
													startIcon={<DeleteOutline />}
												>
													{i18n.t("scheduleModal.form.remove")}
												</Button>
											)}
										</MultFieldLine>
									</Grid>
								</Grid>
							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("scheduleModal.buttons.cancel")}
								</Button>
								<ButtonWrapper>
									<Button
										type="submit"
										color="primary"
										disabled={isSubmitting}
										variant="contained"
									>
										{i18n.t("scheduleModal.buttons.ok")}
									</Button>
									{isSubmitting && <ButtonProgress size={24} />}
								</ButtonWrapper>
							</DialogActions>
						</Form>
					)}
				</Formik>
			</Dialog>
		</Root>
	);
};

export default ScheduleModal;
