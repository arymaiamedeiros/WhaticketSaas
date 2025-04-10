import React, { useState } from "react";
import axios from "axios";
import { styled } from "@mui/material/styles";
import {
  Paper,
  Button,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { Field, Form, Formik } from "formik";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import api from "../../services/api";

const MainPaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  paddingBottom: 100,
}));

const MainHeader = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

const ElementMargin = styled("div")(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const FormContainer = styled("div")({
  maxWidth: 500,
});

const TextRight = styled("div")({
  textAlign: "right",
});

const StyledButton = styled(Button)(({ theme }) => ({
  position: "relative",
}));

const ButtonProgress = styled(CircularProgress)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  marginTop: -12,
  marginLeft: -12,
}));

const MessagesAPI = () => {
  const [formMessageTextData] = useState({ token: "", number: "", body: "" });
  const [formMessageMediaData] = useState({ token: "", number: "", medias: "" });
  const [file, setFile] = useState({});

  const getEndpoint = () => {
    return process.env.REACT_APP_BACKEND_URL + "/api/messages/send";
  };

  const handleSendTextMessage = async (values) => {
    const { number, body } = values;
    const data = { number, body };
    var options = {
      method: "POST",
      url: `${process.env.REACT_APP_BACKEND_URL}/api/messages/send`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${values.token}`,
      },
      data,
    };

    axios
      .request(options)
      .then(function (response) {
        toast.success("Mensagem enviada com sucesso");
      })
      .catch(function (error) {
        toastError(error);
      });
  };

  const handleSendMediaMessage = async (values) => {
    try {
      const firstFile = file[0];
      const data = new FormData();
      data.append("number", values.number);
      data.append("body", firstFile.name);
      data.append("medias", firstFile);
      var options = {
        method: "POST",
        url: `${process.env.REACT_APP_BACKEND_URL}/api/messages/send`,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${values.token}`,
        },
        data,
      };

      axios
        .request(options)
        .then(function (response) {
          toast.success("Mensagem enviada com sucesso");
        })
        .catch(function (error) {
          toastError(error);
        });
    } catch (err) {
      toastError(err);
    }
  };

  const renderFormMessageText = () => {
    return (
      <Formik
        initialValues={formMessageTextData}
        enableReinitialize={true}
        onSubmit={(values, actions) => {
          setTimeout(async () => {
            await handleSendTextMessage(values);
            actions.setSubmitting(false);
            actions.resetForm();
          }, 400);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <FormContainer>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    label={i18n.t("messagesAPI.textMessage.token")}
                    name="token"
                    autoFocus
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    label={i18n.t("messagesAPI.textMessage.number")}
                    name="number"
                    autoFocus
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    label={i18n.t("messagesAPI.textMessage.body")}
                    name="body"
                    autoFocus
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextRight>
                    <StyledButton
                      type="submit"
                      color="primary"
                      variant="contained"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <ButtonProgress size={24} />
                      ) : (
                        "Enviar"
                      )}
                    </StyledButton>
                  </TextRight>
                </Grid>
              </Grid>
            </FormContainer>
          </Form>
        )}
      </Formik>
    );
  };

  const renderFormMessageMedia = () => {
    return (
      <Formik
        initialValues={formMessageMediaData}
        enableReinitialize={true}
        onSubmit={(values, actions) => {
          setTimeout(async () => {
            await handleSendMediaMessage(values);
            actions.setSubmitting(false);
            actions.resetForm();
            document.getElementById("medias").files = null;
            document.getElementById("medias").value = null;
          }, 400);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <FormContainer>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    label={i18n.t("messagesAPI.mediaMessage.token")}
                    name="token"
                    autoFocus
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    label={i18n.t("messagesAPI.mediaMessage.number")}
                    name="number"
                    autoFocus
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <input
                    type="file"
                    name="medias"
                    id="medias"
                    required
                    onChange={(e) => setFile(e.target.files)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextRight>
                    <StyledButton
                      type="submit"
                      color="primary"
                      variant="contained"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <ButtonProgress size={24} />
                      ) : (
                        "Enviar"
                      )}
                    </StyledButton>
                  </TextRight>
                </Grid>
              </Grid>
            </FormContainer>
          </Form>
        )}
      </Formik>
    );
  };

  return (
    <MainPaper variant="outlined">
      <MainHeader variant="h5">
        Documentação para envio de mensagens
      </MainHeader>
      <Typography variant="h6" color="primary">
        Métodos de Envio
      </Typography>
      <ElementMargin>
        {renderFormMessageText()}
      </ElementMargin>
      <ElementMargin>
        {renderFormMessageMedia()}
      </ElementMargin>
    </MainPaper>
  );
};

export default MessagesAPI;
