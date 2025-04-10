import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { styled } from "@mui/material/styles";
import {
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { i18n } from "../../translate/i18n";
import { login } from "../../store/modules/auth/actions";
import api from "../../services/api";

const Root = styled("div")(({ theme }) => ({
  width: "100vw",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(to right, #32be8f, #38d39f)",
  overflow: "hidden",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    height: "100%",
    width: "100%",
    background: "url('/wave.svg')",
    backgroundSize: "cover",
    zIndex: 1,
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
}));

const PaperContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  backgroundColor: "white",
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  zIndex: 2,
  width: "360px",
  [theme.breakpoints.down("sm")]: {
    width: "290px",
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: theme.palette.secondary.main,
}));

const FormContainer = styled(Form)(({ theme }) => ({
  width: "100%",
  marginTop: theme.spacing(1),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
  height: "50px",
  borderRadius: "25px",
  background: "linear-gradient(to right, #32be8f, #38d39f)",
  backgroundSize: "200%",
  transition: "0.5s",
  "&:hover": {
    backgroundPosition: "right",
  },
}));

const Copyright = ({ ...props }) => {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {"Copyright © "}
      <Link color="inherit" href="https://github.com/canove">
        Canove
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", values);
      dispatch(login(data));
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      api.defaults.headers.Authorization = `Bearer ${data.token}`;
      navigate("/tickets");
    } catch (err) {
      toast.error(err.response?.data?.error || "Erro ao fazer login");
    }
    setLoading(false);
  };

  return (
    <Root>
      <PaperContainer elevation={3}>
        <StyledAvatar>
          <LockOutlinedIcon />
        </StyledAvatar>
        <Typography component="h1" variant="h5">
          {i18n.t("login.title")}
        </Typography>
        <Formik
          initialValues={{
            email: "",
            password: "",
          }}
          validationSchema={Yup.object().shape({
            email: Yup.string()
              .email(i18n.t("login.invalidEmail"))
              .required(i18n.t("login.requiredEmail")),
            password: Yup.string().required(i18n.t("login.requiredPassword")),
          })}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <FormContainer>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label={i18n.t("login.form.email")}
                name="email"
                autoComplete="email"
                autoFocus
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label={i18n.t("login.form.password")}
                type="password"
                id="password"
                autoComplete="current-password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
              />
              <SubmitButton
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? i18n.t("login.buttons.logging") : i18n.t("login.buttons.submit")}
              </SubmitButton>
              <Grid container>
                <Grid item xs>
                  <Link href="/forgot" variant="body2">
                    {i18n.t("login.buttons.forgot")}
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="/signup" variant="body2">
                    {i18n.t("login.buttons.create")}
                  </Link>
                </Grid>
              </Grid>
            </FormContainer>
          )}
        </Formik>
      </PaperContainer>
      <Box mt={8} sx={{ position: "absolute", bottom: 20, zIndex: 2 }}>
        <Copyright />
      </Box>
    </Root>
  );
};

export default Login;
