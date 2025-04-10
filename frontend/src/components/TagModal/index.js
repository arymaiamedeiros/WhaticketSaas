import React, { useState, useEffect, useContext } from "react";
import { styled } from '@mui/material/styles';
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import {
	Button,
	TextField,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	CircularProgress,
	IconButton,
	InputAdornment,
	FormControlLabel,
	Switch,
	Checkbox,
	Box
} from "@mui/material";
import { Colorize } from "@mui/icons-material";
import { ColorBox } from 'material-ui-color';
import { green } from "@mui/material/colors";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";

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

const ColorAdornment = styled('div')({
	width: 20,
	height: 20,
});

const TagSchema = Yup.object().shape({
	name: Yup.string()
		.min(3, "Mensagem muito curta")
		.required("Obrigatório")
});

const TagModal = ({ open, onClose, tagId, reload }) => {
	const { user } = useContext(AuthContext);
	const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);

	const initialState = {
		name: "",
		color: "",
		kanban: 0
	};

	const [tag, setTag] = useState(initialState);
	const [kanban, setKanban] = useState(0);

	useEffect(() => {
		try {
			(async () => {
				if (!tagId) return;

				const { data } = await api.get(`/tags/${tagId}`);
				setKanban(data.kanban);
				setTag(prevState => {
					return { ...prevState, ...data };
				});
			})()
		} catch (err) {
			toastError(err);
		}
	}, [tagId, open]);

	const handleClose = () => {
		setTag(initialState);
		setColorPickerModalOpen(false);
		onClose();
	};

	const handleKanbanChange = (e) => {
		setKanban(e.target.checked ? 1 : 0);
	};

	const handleSaveTag = async values => {
		const tagData = { ...values, userId: user.id, kanban };
		try {
			if (tagId) {
				await api.put(`/tags/${tagId}`, tagData);
			} else {
				await api.post("/tags", tagData);
			}
			toast.success(i18n.t("tagModal.success"));
			if (typeof reload == 'function') {
				reload();
			}
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
					{(tagId ? `${i18n.t("tagModal.title.edit")}` : `${i18n.t("tagModal.title.add")}`)}
				</DialogTitle>
				<Formik
					initialValues={tag}
					enableReinitialize={true}
					validationSchema={TagSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveTag(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting, values }) => (
						<Form>
							<DialogContent dividers>
								<MultFieldLine>
									<Field
										as={TextField}
										label={i18n.t("tagModal.form.name")}
										name="name"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										margin="dense"
										onChange={(e) => setTag(prev => ({ ...prev, name: e.target.value }))}
										fullWidth
									/>
								</MultFieldLine>
								<Box sx={{ my: 2 }} />
								<MultFieldLine>
									<Field
										as={TextField}
										fullWidth
										label={i18n.t("tagModal.form.color")}
										name="color"
										id="color"
										error={touched.color && Boolean(errors.color)}
										helperText={touched.color && errors.color}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<ColorAdornment
														style={{ backgroundColor: values.color }}
													/>
												</InputAdornment>
											),
											endAdornment: (
												<IconButton
													size="small"
													color="default"
													onClick={() => setColorPickerModalOpen(!colorPickerModalOpen)}
												>
													<Colorize />
												</IconButton>
											),
										}}
										variant="outlined"
										margin="dense"
									/>
								</MultFieldLine>
								{(user.profile === "admin" || user.profile === "supervisor") && (
									<>
										<MultFieldLine>
											<FormControlLabel
												control={
													<Checkbox
														checked={kanban === 1}
														onChange={handleKanbanChange}
														value={kanban}
														color="primary"
													/>
												}
												label="Kanban"
												labelPlacement="start"
											/>
										</MultFieldLine>
										<Box sx={{ my: 2 }} />
									</>
								)}
								{colorPickerModalOpen && (
									<Box>
										<ColorBox
											disableAlpha={true}
											hslGradient={false}
											style={{ margin: '20px auto 0' }}
											value={tag.color}
											onChange={val => {
												setTag(prev => ({ ...prev, color: `#${val.hex}` }));
											}}
										/>
									</Box>
								)}
							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("tagModal.buttons.cancel")}
								</Button>
								<ButtonWrapper>
									<Button
										type="submit"
										color="primary"
										disabled={isSubmitting}
										variant="contained"
									>
										{tagId
											? `${i18n.t("tagModal.buttons.okEdit")}`
											: `${i18n.t("tagModal.buttons.okAdd")}`}
										{isSubmitting && <ButtonProgress size={24} />}
									</Button>
								</ButtonWrapper>
							</DialogActions>
						</Form>
					)}
				</Formik>
			</Dialog>
		</Root>
	);
};

export default TagModal;
