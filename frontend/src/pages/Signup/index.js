import React, { useState, useEffect } from "react";
import qs from 'query-string';

import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field } from "formik";
import usePlans from "../../hooks/usePlans";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import InputMask from 'react-input-mask';
import api from "../../services/api";
import {
	FormControl,
	InputLabel,
	MenuItem,
	Select,
} from "@material-ui/core";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles, useTheme } from "@material-ui/core/styles";  // Added useTheme
import Container from "@material-ui/core/Container";
import { i18n } from "../../translate/i18n";

import { openApi } from "../../services/api";
import toastError from "../../errors/toastError";
import moment from "moment";

const Copyright = () => {
	return (
		<Typography variant="body2" color="textSecondary" align="center">
			{"Copyright © "}
			<Link color="inherit" href="#">
				Whaticket Saas
			</Link>{" "}
		   {new Date().getFullYear()}
			{"."}
		</Typography>
	);
};

const useStyles = makeStyles(theme => ({
	paper: {
		marginTop: theme.spacing(8),
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: "100%",
		marginTop: theme.spacing(3),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
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
	const classes = useStyles();
	const history = useHistory();
	const theme = useTheme();  // Added to access theme
	const [allowregister, setallowregister] = useState('enabled');
    const [trial, settrial] = useState('3');
	
	const logoLight = `${process.env.REACT_APP_BACKEND_URL}/public/logotipos/interno.png`;
	const logoDark = `${process.env.REACT_APP_BACKEND_URL}/public/logotipos/logo_w.png`;

	// Use theme.palette.type to set the initial logo based on light or dark mode
	const initialLogo = theme.palette.type === 'light' ? logoLight : logoDark;
	const [logoImg, setLogoImg] = useState(initialLogo);
	
	let companyId = null;

	useEffect(() => {
        fetchallowregister();
        fetchtrial();
    }, []);

    const fetchtrial = async () => {
        try {
            const responsevvv = await api.get("/settings/trial");
            const allowtrialX = responsevvv.data.value;
            settrial(allowtrialX);
        } catch (error) {
            console.error('Error retrieving trial', error);
        }
    };

    const fetchallowregister = async () => {
        try {
            const responsevv = await api.get("/settings/allowregister");
            const allowregisterX = responsevv.data.value;
            setallowregister(allowregisterX);
        } catch (error) {
            console.error('Error retrieving allowregister', error);
        }
    };

    if(allowregister === "disabled"){
    	history.push("/login");    
    }

	const params = qs.parse(window.location.search);
	if (params.companyId !== undefined) {
		companyId = params.companyId;
	}

	const initialState = { name: "", email: "", phone: "", password: "", planId: "disabled" };

	const [user] = useState(initialState);
	const dueDate = moment().add(trial, "day").format();

	const handleSignUp = async values => {
		Object.assign(values, { recurrence: "MENSAL" });
		Object.assign(values, { dueDate: dueDate });
		Object.assign(values, { status: "t" });
		Object.assign(values, { campaignsEnabled: true });
		try {
			await openApi.post("/companies/cadastro", values);
			toast.success(i18n.t("signup.toasts.success"));
			history.push("/login");
		} catch (err) {
			console.log(err);
			toastError(err);
		}
	};

	const [plans, setPlans] = useState([]);
	const { register: listPlans } = usePlans();

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
			<div className={classes.paper}>
				<div>
				<img src={`${logoImg}?r=${Math.random()}`} style={{ margin: "0 auto" , width: "50%"}} alt={`${process.env.REACT_APP_NAME_SYSTEM}`} />
				</div>
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
						<Form className={classes.form}>
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
										as={InputMask}
										mask="(99) 99999-9999"
										variant="outlined"
										fullWidth
										id="phone"
										name="phone"
										error={touched.phone && Boolean(errors.phone)}
										helperText={touched.phone && errors.phone}
										autoComplete="phone"
										required
									>
										{({ field }) => (
											<TextField
												{...field}
												variant="outlined"
												fullWidth
												label="DDD988888888"
												inputProps={{ maxLength: 11 }} // Definindo o limite de caracteres
											/>
										)}
									</Field>
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
									<InputLabel htmlFor="plan-selection">Plano</InputLabel>
									<Field
										as={Select}
										variant="outlined"
										fullWidth
										id="plan-selection"
										label="Plano"
										name="planId"
										required
									>
                                        <MenuItem value="disabled" disabled>
                                        	<em>Selecione seu plano de assinatura</em>
										</MenuItem>
										{plans.map((plan, key) => (
											<MenuItem key={key} value={plan.id}>
										        {plan.name} - {plan.connections} WhatsApps - {plan.users} Usuários - R$ {plan.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
											</MenuItem>
										))}
									</Field>
								</Grid>
							</Grid>
							<Button
								type="submit"
								fullWidth
								variant="contained"
								color="primary"
								className={classes.submit}
								disabled={isSubmitting}
							>
								{i18n.t("signup.buttons.submit")}
							</Button>
							<Grid container justifyContent="flex-end">
								<Grid item>
									<Link component={RouterLink} to="/login" variant="body2">
										{i18n.t("signup.buttons.login")}
									</Link>
								</Grid>
							</Grid>
						</Form>
					)}
				</Formik>
			</div>
			<Box mt={5}>
				<Copyright />
			</Box>
		</Container>
	);
};

export default SignUp;
