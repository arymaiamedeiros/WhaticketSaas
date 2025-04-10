import React, { useContext, useState, useEffect, useRef } from "react";
import { styled } from '@mui/material/styles';
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { green } from '@mui/material/colors';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  IconButton,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Box
} from "@mui/material";
import {
  AttachFile as AttachFileIcon,
  DeleteOutline as DeleteOutlineIcon
} from '@mui/icons-material';
import { i18n } from "../../translate/i18n";
import { head } from "lodash";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import MessageVariablesPicker from "../MessageVariablesPicker";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ConfirmationModal from "../ConfirmationModal";

const path = require('path');

const FormWrapper = styled('div')({
  display: "flex",
  flexWrap: "wrap",
});

const MultiFieldLine = styled('div')(({ theme }) => ({
  display: "flex",
  "& > *:not(:last-child)": {
    marginRight: theme.spacing(1),
  },
}));

const ButtonWrapper = styled('div')({
  position: "relative",
});

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  margin: theme.spacing(1),
  minWidth: 120,
}));

const ColorAdornment = styled('div')({
  width: 20,
  height: 20,
});

const LoadingProgress = styled(CircularProgress)({
  color: green[500],
  position: "absolute",
  top: "50%",
  left: "50%",
  marginTop: -12,
  marginLeft: -12,
});

const QuickeMessageSchema = Yup.object().shape({
  shortcode: Yup.string().required("Obrigatório"),
});

const QuickMessageDialog = ({ open, onClose, quickemessageId, reload }) => {
  const { user } = useContext(AuthContext);
  const { profile } = user;
  const messageInputRef = useRef();

  const initialState = {
    shortcode: "",
    message: "",
    geral: false,
    status: true,
  };

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [quickemessage, setQuickemessage] = useState(initialState);
  const [attachment, setAttachment] = useState(null);
  const attachmentFile = useRef(null);

  useEffect(() => {
    try {
      (async () => {
        if (!quickemessageId) return;
        const { data } = await api.get(`/quick-messages/${quickemessageId}`);
        setQuickemessage((prevState) => {
          return { ...prevState, ...data };
        });
      })();
    } catch (err) {
      toastError(err);
    }
  }, [quickemessageId, open]);

  const handleClose = () => {
    setQuickemessage(initialState);
    setAttachment(null);
    onClose();
  };

  const handleAttachmentFile = (e) => {
    const file = head(e.target.files);
    if (file) {
      setAttachment(file);
    }
  };

  const handleSaveQuickeMessage = async (values) => {
    const quickemessageData = {
      ...values,
      isMedia: true,
      mediaPath: attachment
        ? String(attachment.name).replace(/ /g, "_")
        : values.mediaPath
        ? path.basename(values.mediaPath).replace(/ /g, "_")
        : null,
    };

    try {
      if (quickemessageId) {
        await api.put(`/quick-messages/${quickemessageId}`, quickemessageData);
        if (attachment != null) {
          const formData = new FormData();
          formData.append("typeArch", "quickMessage");
          formData.append("file", attachment);
          await api.post(
            `/quick-messages/${quickemessageId}/media-upload`,
            formData
          );
        }
      } else {
        const { data } = await api.post("/quick-messages", quickemessageData);
        if (attachment != null) {
          const formData = new FormData();
          formData.append("typeArch", "quickMessage");
          formData.append("file", attachment);
          await api.post(`/quick-messages/${data.id}/media-upload`, formData);
        }
      }
      toast.success(i18n.t("quickMessages.toasts.success"));
      if (typeof reload == "function") {
        reload();
      }
    } catch (err) {
      toastError(err);
    }
    handleClose();
  };

  const deleteMedia = async () => {
    if (attachment) {
      setAttachment(null);
      attachmentFile.current.value = null;
    }

    if (quickemessage.mediaPath) {
      await api.delete(`/quick-messages/${quickemessage.id}/media-upload`);
      setQuickemessage((prev) => ({
        ...prev,
        mediaPath: null,
      }));
      toast.success(i18n.t("quickMessages.toasts.deleted"));
      if (typeof reload == "function") {
        reload();
      }
    }
  };

  const handleClickMsgVar = async (msgVar, setValueFunc) => {
    const el = messageInputRef.current;
    const firstHalfText = el.value.substring(0, el.selectionStart);
    const secondHalfText = el.value.substring(el.selectionEnd);
    const newCursorPos = el.selectionStart + msgVar.length;

    setValueFunc("message", `${firstHalfText}${msgVar}${secondHalfText}`);

    await new Promise(r => setTimeout(r, 100));
    messageInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
  };

  return (
    <FormWrapper>
      <ConfirmationModal
        title={i18n.t("quickMessages.confirmationModal.deleteTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={deleteMedia}
      >
        {i18n.t("quickMessages.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          {quickemessageId
            ? i18n.t("quickMessages.dialog.edit")
            : i18n.t("quickMessages.dialog.add")}
        </DialogTitle>
        <Box sx={{ display: "none" }}>
          <input
            type="file"
            ref={attachmentFile}
            onChange={(e) => handleAttachmentFile(e)}
          />
        </Box>
        <Formik
          initialValues={quickemessage}
          enableReinitialize={true}
          validationSchema={QuickeMessageSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveQuickeMessage(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, setFieldValue, values }) => (
            <Form>
              <DialogContent dividers>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      autoFocus
                      label={i18n.t("quickMessages.dialog.shortcode")}
                      name="shortcode"
                      error={touched.shortcode && Boolean(errors.shortcode)}
                      helperText={touched.shortcode && errors.shortcode}
                      variant="outlined"
                      margin="dense"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      label={i18n.t("quickMessages.dialog.message")}
                      name="message"
                      inputRef={messageInputRef}
                      multiline
                      rows={5}
                      error={touched.message && Boolean(errors.message)}
                      helperText={touched.message && errors.message}
                      variant="outlined"
                      margin="dense"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MessageVariablesPicker
                      disabled={isSubmitting}
                      onClick={value => handleClickMsgVar(value, setFieldValue)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledFormControl fullWidth variant="outlined" margin="dense">
                      <InputLabel>{i18n.t("quickMessages.dialog.status")}</InputLabel>
                      <Field
                        as={Select}
                        name="status"
                        label={i18n.t("quickMessages.dialog.status")}
                      >
                        <MenuItem value={true}>Ativo</MenuItem>
                        <MenuItem value={false}>Inativo</MenuItem>
                      </Field>
                    </StyledFormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <StyledFormControl fullWidth variant="outlined" margin="dense">
                      <InputLabel>{i18n.t("quickMessages.dialog.geral")}</InputLabel>
                      <Field
                        as={Select}
                        name="geral"
                        label={i18n.t("quickMessages.dialog.geral")}
                      >
                        <MenuItem value={true}>Sim</MenuItem>
                        <MenuItem value={false}>Não</MenuItem>
                      </Field>
                    </StyledFormControl>
                  </Grid>
                  {(profile === "admin" || profile === "supervisor") && (
                    <Grid item xs={12}>
                      <MultiFieldLine>
                        {(attachment || quickemessage.mediaPath) && (
                          <ButtonWrapper>
                            <Button
                              variant="contained"
                              color="primary"
                              disabled={isSubmitting}
                              onClick={() => setConfirmationOpen(true)}
                            >
                              {i18n.t("quickMessages.buttons.deleteMedia")}
                              {isSubmitting && <LoadingProgress size={24} />}
                            </Button>
                          </ButtonWrapper>
                        )}
                        <ButtonWrapper>
                          <Button
                            variant="contained"
                            color="primary"
                            disabled={isSubmitting}
                            onClick={() => attachmentFile.current.click()}
                          >
                            {i18n.t("quickMessages.buttons.attach")}
                            {isSubmitting && <LoadingProgress size={24} />}
                          </Button>
                        </ButtonWrapper>
                      </MultiFieldLine>
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                >
                  {i18n.t("quickMessages.buttons.cancel")}
                </Button>
                <ButtonWithSpinner
                  loading={isSubmitting}
                  type="submit"
                  color="primary"
                  variant="contained"
                  autoFocus
                >
                  {quickemessageId
                    ? i18n.t("quickMessages.buttons.edit")
                    : i18n.t("quickMessages.buttons.add")}
                </ButtonWithSpinner>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </FormWrapper>
  );
};

export default QuickMessageDialog;
