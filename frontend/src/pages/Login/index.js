import React, { useState, useContext, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";

import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid"; 
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        flexDirection: 'row',
        height: '100vh',
        [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
        },
    },
    leftSide: {
        flex: 1,
	background: "linear-gradient(to right, #fafafa , #fafafa , #fafafa)",
        //backgroundImage: "url(https://i.imgur.com/Yu3cnE9.png)",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        [theme.breakpoints.down('sm')]: {
            height: '50vh',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
        },
    },
    rightSide: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.background.default,
        [theme.breakpoints.down('sm')]: {
            height: '50vh',
        },
    },
    paper: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "55px 30px",
    },
    form: {
        width: "100%", 
        marginTop: theme.spacing(1),
    },
    inputField: {
        margin: theme.spacing(2, 0),
        '& input': {
            padding: "10px 0",
        },
        '& .MuiInput-underline:before': {
            borderBottom: "2px solid #ccc",
        },
        '& .MuiInput-underline:hover:before': {
            borderBottom: "2px solid #000",
        },
        '& .MuiInput-underline:after': {
            borderBottom: "2px solid #2575fc",
        }
    },
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
    link: {
        marginTop: theme.spacing(2),
        textDecoration: "none",
        '&:hover': {
            textDecoration: "underline",
        }
    }
}));

const Login = () => {
    const classes = useStyles();

    const [user, setUser] = useState({ email: "", password: "" });
    const { handleLogin } = useContext(AuthContext);
    const [viewregister, setviewregister] = useState('disabled');

    const handleChangeInput = e => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        fetchviewregister();
    }, []);

    const fetchviewregister = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setviewregister('disabled');
                return;
            }
            
            const responsev = await api.get("/settings/viewregister", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const viewregisterX = responsev?.data?.value;
            setviewregister(viewregisterX);
        } catch (error) {
            console.error('Error retrieving viewregister', error);
            setviewregister('disabled');
        }
    };

    const handlSubmit = e => {
        e.preventDefault();
        handleLogin(user);
    };

    const logo = `${process.env.REACT_APP_BACKEND_URL}/public/logotipos/tela-login.png`;
    const randomValue = Math.random();
    const logoWithRandom = `${logo}?r=${randomValue}`;

    return (
        <div className={classes.root}>
            <div className={classes.leftSide}>
                <img style={{ margin: "0 auto", width: "80%" }} src={logoWithRandom} alt={`${process.env.REACT_APP_NAME_SYSTEM}`} />
            </div>
            <div className={classes.rightSide}>
                <Container component="main" maxWidth="xs">
                    <CssBaseline/>
                    <div className={classes.paper}>
                        <form className={classes.form} noValidate onSubmit={handlSubmit}>
                            <TextField
                                variant="standard"
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label={i18n.t("login.form.email")}
                                name="email"
                                value={user.email}
                                onChange={handleChangeInput}
                                autoComplete="email"
                                autoFocus
                                className={classes.inputField}
                            />
                            <TextField
                                variant="standard"
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label={i18n.t("login.form.password")}
                                type="password"
                                id="password"
                                value={user.password}
                                onChange={handleChangeInput}
                                autoComplete="current-password"
                                className={classes.inputField}
                            />
                            <Grid container justifyContent="flex-end">
                                <Grid item xs={6} style={{ textAlign: "right" }}>
                                    <Link component={RouterLink} to="/forgetpsw" variant="body2" className={classes.link}>
                                        Esqueceu sua senha?
                                    </Link>
                                </Grid>
                            </Grid>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
								color="primary"
                                className={classes.submit}
                            >
                                {i18n.t("login.buttons.submit")}
                            </Button>
                            {viewregister === "enabled" && (
                            <Grid container>
                                <Grid item>
                                    <Link
                                        href="#"
                                        variant="body2"
                                        component={RouterLink}
                                        to="/signup"
                                        className={classes.link}
                                    >
                                        {i18n.t("login.buttons.register")}
                                    </Link>
                                </Grid>
                            </Grid>
                            )}
                        </form>
                    </div>
                </Container>
            </div>
        </div>
    );
};

export default Login;
