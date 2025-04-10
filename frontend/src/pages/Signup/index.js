import React, { useState, useEffect } from "react";
import { styled } from '@mui/material/styles';
import qs from 'query-string'
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field } from "formik";
import usePlans from "../../hooks/usePlans";
import {
	Avatar,
	Button,
	CssBaseline,
	TextField,
	Link,
	Grid,
	Box,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Typography,
	Container,
	Paper
} from "@mui/material";
import { LockOutlined as LockOutlinedIcon } from "@mui/icons-material";
import moment from "moment";

import logo from "../../assets/logo.png";
import { i18n } from "../../translate/i18n";
import { openApi } from "../../services/api";
import toastError from "../../errors/toastError";

const Copyright = () => {
	return (
		<Typography variant="body2" color="text.secondary" align="center">
			{"Copyright © "}
			<Link color="inherit" href="#">
				Whaticket
			</Link>{" "}
			{new Date().getFullYear()}
			{"."}
		</Typography>
	);
};

const PaperContainer = styled(Paper)(({ theme }) => ({
	marginTop: theme.spacing(8),
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	padding: theme.spacing(2),
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
	margin: theme.spacing(1),
	backgroundColor: theme.palette.secondary.main,
}));

const FormContainer = styled('div')(({ theme }) => ({
	width: "100%",
	marginTop: theme.spacing(3),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
	margin: theme.spacing(3, 0, 2),
}));

const UserSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
	password: Yup.string().min(5, "Too Short!").max(50, "Too Long!"),
	email: Yup.string().email("Invalid email").required("Required"),
});

const SignUp = () => {
	const navigate = useNavigate();
	let companyId = null;

	const params = qs.parse(window.location.search);
	if (params.companyId !== undefined) {
		companyId = params.companyId;
	}

	const initialState = { 
		name: "", 
		email: "", 
		phone: "", 
		password: "", 
		planId: "" 
	};

	const [user] = useState(initialState);
	const dueDate = moment().add(3, "day").format();
	const [plans, setPlans] = useState([]);
	const { list: listPlans } = usePlans();

	const handleSignUp = async values => {
		Object.assign(values, { 
			recurrence: "MENSAL",
			dueDate: dueDate,
			status: "t",
			campaignsEnabled: true 
		});
		try {
			await openApi.post("/companies/cadastro", values);
			toast.success(i18n.t("signup.toasts.success"));
			navigate("/login");
		} catch (err) {
			console.log(err);
			toastError(err);
		}
	};

	useEffect(() => {
		async function fetchData() {
			const list = await listPlans();
			setPlans(list);
		}
		fetchData();
	}, []);

	return (
		<Container component="main" maxWidth="xs">
			<CssBaseline />
			<PaperContainer>
				<Box sx={{ mb: 2 }}>
					<img 
						style={{ margin: "0 auto", height: "80px", width: "100%" }} 
						src={logo} 
						alt="Whats" 
					/>
				</Box>
				<Formik
					initialValues={user}
					enableReinitialize={true}
					validationSchema={UserSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSignUp(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting }) => (
						<FormContainer>
							<Grid container spacing={2}>
								<Grid item xs={12}>
									<Field
										as={TextField}
										autoComplete="name"
										name="name"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										fullWidth
										id="name"
										label="Nome da Empresa"
									/>
								</Grid>

								<Grid item xs={12}>
									<Field
										as={TextField}
										variant="outlined"
										fullWidth
										id="email"
										label={i18n.t("signup.form.email")}
										name="email"
										error={touched.email && Boolean(errors.email)}
										helperText={touched.email && errors.email}
										autoComplete="email"
										required
									/>
								</Grid>
								
								<Grid item xs={12}>
									<Field
										as={TextField}
										variant="outlined"
										fullWidth
										id="phone"
										label="Telefone com (DDD)"
										name="phone"
										error={touched.phone && Boolean(errors.phone)}
										helperText={touched.phone && errors.phone}
										autoComplete="phone"
										required
									/>
								</Grid>

								<Grid item xs={12}>
									<Field
										as={TextField}
										variant="outlined"
										fullWidth
										name="password"
										error={touched.password && Boolean(errors.password)}
										helperText={touched.password && errors.password}
										label={i18n.t("signup.form.password")}
										type="password"
										id="password"
										autoComplete="current-password"
										required
									/>
								</Grid>
								<Grid item xs={12}>
									<FormControl fullWidth>
										<InputLabel id="plan-selection-label">Plano</InputLabel>
										<Field
											as={Select}
											variant="outlined"
											id="plan-selection"
											labelId="plan-selection-label"
											name="planId"
											required
										>
											{plans.map((plan, key) => (
												<MenuItem key={key} value={plan.id}>
													{plan.name} - Atendentes: {plan.users} - WhatsApp: {plan.connections} - Filas: {plan.queues} - R$ {plan.value}
												</MenuItem>
											))}
										</Field>
									</FormControl>
								</Grid>
							</Grid>
							<SubmitButton
								type="submit"
								fullWidth
								variant="contained"
								color="primary"
							>
								{i18n.t("signup.buttons.submit")}
							</SubmitButton>
							<Grid container justifyContent="flex-end">
								<Grid item>
									<Link
										component={RouterLink}
										to="/login"
										variant="body2"
									>
										{i18n.t("signup.buttons.login")}
									</Link>
								</Grid>
							</Grid>
						</FormContainer>
					)}
				</Formik>
			</PaperContainer>
			<Box mt={5}>
				<Copyright />
			</Box>
		</Container>
	);
};

export default SignUp;
