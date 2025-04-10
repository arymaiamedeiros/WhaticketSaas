import React, { useState, useEffect, useContext } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { styled } from '@mui/material/styles';
import { green } from '@mui/material/colors';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Box from '@mui/material/Box';

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import useWhatsApps from "../../hooks/useWhatsApps";

const Root = styled('div')({
	display: "flex",
	flexWrap: "wrap",
});

const MultFieldLine = styled(Box)(({ theme }) => ({
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

const UserSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
	password: Yup.string().min(5, "Too Short!").max(50, "Too Long!"),
	email: Yup.string().email("Invalid email").required("Required"),
});

const UserModal = ({ open, onClose, userId }) => {
	const initialState = {
		name: "",
		email: "",
		password: "",
		profile: "user",
	};

	const { user: loggedInUser } = useContext(AuthContext);
	const [user, setUser] = useState(initialState);
	const [selectedQueueIds, setSelectedQueueIds] = useState([]);
	const [whatsappId, setWhatsappId] = useState(false);
	const { loading, whatsApps } = useWhatsApps();

	useEffect(() => {
		const fetchUser = async () => {
			if (!userId) return;
			try {
				const { data } = await api.get(`/users/${userId}`);
				setUser(prevState => {
					return { ...prevState, ...data };
				});
				const userQueueIds = data.queues?.map(queue => queue.id);
				setSelectedQueueIds(userQueueIds);
				setWhatsappId(data.whatsappId ? data.whatsappId : '');
			} catch (err) {
				toastError(err);
			}
		};

		fetchUser();
	}, [userId, open]);

	const handleClose = () => {
		onClose();
		setUser(initialState);
	};

	const handleSaveUser = async values => {
		const userData = { ...values, whatsappId, queueIds: selectedQueueIds };
		try {
			if (userId) {
				await api.put(`/users/${userId}`, userData);
			} else {
				await api.post("/users", userData);
			}
			toast.success(i18n.t("userModal.success"));
		} catch (err) {
			toastError(err);
		}
		handleClose();
	};

	return (
		<Root>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="xs"
				fullWidth
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title">
					{userId
						? `${i18n.t("userModal.title.edit")}`
						: `${i18n.t("userModal.title.add")}`}
				</DialogTitle>
				<Formik
					initialValues={user}
					enableReinitialize={true}
					validationSchema={UserSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveUser(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting }) => (
						<Form>
							<DialogContent dividers>
								<MultFieldLine>
									<Field
										as={TextField}
										label={i18n.t("userModal.form.name")}
										autoFocus
										name="name"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										margin="dense"
										fullWidth
									/>
									<Field
										as={TextField}
										label={i18n.t("userModal.form.password")}
										type="password"
										name="password"
										error={touched.password && Boolean(errors.password)}
										helperText={touched.password && errors.password}
										variant="outlined"
										margin="dense"
										fullWidth
									/>
								</MultFieldLine>
								<MultFieldLine>
									<Field
										as={TextField}
										label={i18n.t("userModal.form.email")}
										name="email"
										error={touched.email && Boolean(errors.email)}
										helperText={touched.email && errors.email}
										variant="outlined"
										margin="dense"
										fullWidth
									/>
									<StyledFormControl
										variant="outlined"
										margin="dense"
									>
										<Can
											role={loggedInUser.profile}
											perform="user-modal:editProfile"
											yes={() => (
												<>
													<InputLabel id="profile-selection-input-label">
														{i18n.t("userModal.form.profile")}
													</InputLabel>
													<Field
														as={Select}
														label={i18n.t("userModal.form.profile")}
														name="profile"
														labelId="profile-selection-label"
														id="profile-selection"
														required
													>
														<MenuItem value="admin">Admin</MenuItem>
														<MenuItem value="user">User</MenuItem>
													</Field>
												</>
											)}
										/>
									</StyledFormControl>
								</MultFieldLine>
								<Can
									role={loggedInUser.profile}
									perform="user-modal:editQueues"
									yes={() => (
										<QueueSelect
											selectedQueueIds={selectedQueueIds}
											onChange={values => setSelectedQueueIds(values)}
										/>
									)}
								/>
								<Can
									role={loggedInUser.profile}
									perform="user-modal:editProfile"
									yes={() => (
										<StyledFormControl variant="outlined" margin="dense" fullWidth>
											<InputLabel>
												{i18n.t("userModal.form.whatsapp")}
											</InputLabel>
											<Field
												as={Select}
												value={whatsappId}
												onChange={(e) => setWhatsappId(e.target.value)}
												label={i18n.t("userModal.form.whatsapp")}
											>
												<MenuItem value={''}>&nbsp;</MenuItem>
												{whatsApps.map((whatsapp) => (
													<MenuItem key={whatsapp.id} value={whatsapp.id}>{whatsapp.name}</MenuItem>
												))}
											</Field>
										</StyledFormControl>
									)}
								/>
							</DialogContent>
							<DialogActions>
								<Button onClick={handleClose} color="secondary">
									{i18n.t("userModal.buttons.cancel")}
								</Button>
								<ButtonWrapper>
									<Button
										type="submit"
										color="primary"
										variant="contained"
										disabled={isSubmitting}
									>
										{userId
											? i18n.t("userModal.buttons.okEdit")
											: i18n.t("userModal.buttons.okAdd")}
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

export default UserModal;
