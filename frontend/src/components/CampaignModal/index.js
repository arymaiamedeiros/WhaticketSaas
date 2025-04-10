import React, { useState, useEffect, useRef, useContext } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { head } from "lodash";
import { styled } from '@mui/material/styles';
import { green } from '@mui/material/colors';
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CircularProgress from "@mui/material/CircularProgress";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

import { i18n } from "../../translate/i18n";
import moment from "moment";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import ConfirmationModal from "../ConfirmationModal";

const Root = styled('div')({
    display: "flex",
    flexWrap: "wrap",
    backgroundColor: "#fff"
});

const TabContainer = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.campaigntab,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    marginRight: theme.spacing(1),
    flex: 1,
}));

const ExtraAttr = styled('div')({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
});

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

const CampaignSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
});

const CampaignModal = ({
  open,
  onClose,
  campaignId,
  initialValues,
  onSave,
  resetPagination,
}) => {
  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);
  const { companyId } = user;
  const [file, setFile] = useState(null);

  const initialState = {
    name: "",
    message1: "",
    message2: "",
    message3: "",
    message4: "",
    message5: "",
    confirmationMessage1: "",
    confirmationMessage2: "",
    confirmationMessage3: "",
    confirmationMessage4: "",
    confirmationMessage5: "",
    status: "INATIVA", // INATIVA, PROGRAMADA, EM_ANDAMENTO, CANCELADA, FINALIZADA,
    confirmation: false,
    scheduledAt: "",
    whatsappId: "",
    contactListId: "",
    tagListId: "Nenhuma",
    companyId,
  };

  const [campaign, setCampaign] = useState(initialState);
  const [whatsapps, setWhatsapps] = useState([]);
  const [contactLists, setContactLists] = useState([]);
  const [messageTab, setMessageTab] = useState(0);
  const [attachment, setAttachment] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [campaignEditable, setCampaignEditable] = useState(true);
  const attachmentFile = useRef(null);
  const [tagLists, setTagLists] = useState([]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/files/", {
          params: { companyId }
        });

        setFile(data.files);
      } catch (err) {
        toastError(err);
      }
    })();
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      if (initialValues) {
        setCampaign((prevState) => {
          return { ...prevState, ...initialValues };
        });
      }

      api
        .get(`/contact-lists/list`, { params: { companyId } })
        .then(({ data }) => setContactLists(data));

      api
        .get(`/whatsapp`, { params: { companyId, session: 0 } })
        .then(({ data }) => setWhatsapps(data));

      api.get(`/tags`, { params: { companyId } })
        .then(({ data }) => {
          const fetchedTags = data.tags;
          // Perform any necessary data transformation here
          const formattedTagLists = fetchedTags.map((tag) => ({
            id: tag.id,
            name: tag.name,
          }));
          setTagLists(formattedTagLists);
        })
        .catch((error) => {
          console.error("Error retrieving tags:", error);
        });
        
      if (!campaignId) return;

      api.get(`/campaigns/${campaignId}`).then(({ data }) => {
        setCampaign((prev) => {
          let prevCampaignData = Object.assign({}, prev);

          Object.entries(data).forEach(([key, value]) => {
            if (key === "scheduledAt" && value !== "" && value !== null) {
              prevCampaignData[key] = moment(value).format("YYYY-MM-DDTHH:mm");
            } else {
              prevCampaignData[key] = value === null ? "" : value;
            }
          });

          return prevCampaignData;
        });
      });
    }
  }, [campaignId, open, initialValues, companyId]);

  useEffect(() => {
    const now = moment();
    const scheduledAt = moment(campaign.scheduledAt);
    const moreThenAnHour =
      !Number.isNaN(scheduledAt.diff(now)) && scheduledAt.diff(now, "hour") > 1;
    const isEditable =
      campaign.status === "INATIVA" ||
      (campaign.status === "PROGRAMADA" && moreThenAnHour);

    setCampaignEditable(isEditable);
  }, [campaign.status, campaign.scheduledAt]);

  const handleClose = () => {
    onClose();
    setCampaign(initialState);
  };

  const handleAttachmentFile = (e) => {
    const file = head(e.target.files);
    if (file) {
      setAttachment(file);
    }
  };

  const handleSaveCampaign = async (values) => {
    try {
      const dataValues = {};
      Object.entries(values).forEach(([key, value]) => {
        if (key === "scheduledAt" && value !== "" && value !== null) {
          dataValues[key] = moment(value).format("YYYY-MM-DD HH:mm:ss");
        } else {
          dataValues[key] = value === "" ? null : value;
        }
      });

      if (campaignId) {
        await api.put(`/campaigns/${campaignId}`, dataValues);

        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/campaigns/${campaignId}/media-upload`, formData);
        }
        handleClose();
      } else {
        const { data } = await api.post("/campaigns", dataValues);

        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/campaigns/${data.id}/media-upload`, formData);
        }
        if (onSave) {
          onSave(data);
        }
        handleClose();
      }
      toast.success(i18n.t("campaigns.toasts.success"));
    } catch (err) {
      console.log(err);
      toastError(err);
    }
  };

  const deleteMedia = async () => {
    if (attachment) {
      setAttachment(null);
      attachmentFile.current.value = null;
    }

    if (campaign.mediaPath) {
      await api.delete(`/campaigns/${campaign.id}/media-upload`);
      setCampaign((prev) => ({ ...prev, mediaPath: null, mediaName: null }));
      toast.success(i18n.t("campaigns.toasts.deleted"));
    }
  };

  const renderMessageField = (identifier) => {
    return (
      <Field
        as={TextField}
        id={identifier}
        name={identifier}
        fullWidth
        rows={5}
        label={i18n.t(`campaigns.dialog.form.${identifier}`)}
        placeholder={i18n.t("campaigns.dialog.form.messagePlaceholder")}
        multiline={true}
        variant="outlined"
        helperText="Utilize variáveis como {nome}, {numero}, {email} ou defina variáveis personalziadas."
        disabled={!campaignEditable && campaign.status !== "CANCELADA"}
      />
    );
  };

  const renderConfirmationMessageField = (identifier) => {
    return (
      <Field
        as={TextField}
        id={identifier}
        name={identifier}
        fullWidth
        rows={5}
        label={i18n.t(`campaigns.dialog.form.${identifier}`)}
        placeholder={i18n.t("campaigns.dialog.form.messagePlaceholder")}
        multiline={true}
        variant="outlined"
        disabled={!campaignEditable && campaign.status !== "CANCELADA"}
      />
    );
  };

  const cancelCampaign = async () => {
    try {
      await api.post(`/campaigns/${campaign.id}/cancel`);
      toast.success(i18n.t("campaigns.toasts.cancel"));
      setCampaign((prev) => ({ ...prev, status: "CANCELADA" }));
      resetPagination();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const restartCampaign = async () => {
    try {
      await api.post(`/campaigns/${campaign.id}/restart`);
      toast.success(i18n.t("campaigns.toasts.restart"));
      setCampaign((prev) => ({ ...prev, status: "EM_ANDAMENTO" }));
      resetPagination();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Root>
      <ConfirmationModal
        title={i18n.t("campaignModal.confirmationModal.deleteTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={deleteMedia}
      >
        {i18n.t("campaignModal.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {i18n.t("campaignModal.title")}
        </DialogTitle>
        <div style={{ display: "none" }}>
          <input
            type="file"
            id="button-file"
            accept=".pdf,.csv,.xlsx,.xls,image/*,.doc,.docx,.ppt,.pptx,.txt,.zip"
            ref={attachmentFile}
            onChange={handleAttachmentFile}
          />
        </div>
        <Formik
          initialValues={campaign}
          enableReinitialize={true}
          validationSchema={CampaignSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveCampaign(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent dividers>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Field
                      as={StyledTextField}
                      label={i18n.t("campaignModal.form.name")}
                      name="name"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      variant="outlined"
                      margin="dense"
                      fullWidth
                      disabled={!campaignEditable}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TabContainer>
                      <Tabs
                        value={messageTab}
                        onChange={(_, newValue) => setMessageTab(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                      >
                        <Tab label={i18n.t("campaignModal.form.message1")} />
                        <Tab label={i18n.t("campaignModal.form.message2")} />
                        <Tab label={i18n.t("campaignModal.form.message3")} />
                        <Tab label={i18n.t("campaignModal.form.message4")} />
                        <Tab label={i18n.t("campaignModal.form.message5")} />
                      </Tabs>
                    </TabContainer>
                    {renderMessageField(messageTab + 1)}
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={FormControl}
                      variant="outlined"
                      margin="dense"
                      fullWidth
                    >
                      <InputLabel>
                        {i18n.t("campaignModal.form.whatsapp")}
                      </InputLabel>
                      <Select
                        name="whatsappId"
                        value={values.whatsappId}
                        label={i18n.t("campaignModal.form.whatsapp")}
                        disabled={!campaignEditable}
                      >
                        {whatsapps.map((whatsapp) => (
                          <MenuItem key={whatsapp.id} value={whatsapp.id}>
                            {whatsapp.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </Field>
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={FormControl}
                      variant="outlined"
                      margin="dense"
                      fullWidth
                    >
                      <InputLabel>
                        {i18n.t("campaignModal.form.contactList")}
                      </InputLabel>
                      <Select
                        name="contactListId"
                        value={values.contactListId}
                        label={i18n.t("campaignModal.form.contactList")}
                        disabled={!campaignEditable}
                      >
                        {contactLists.map((contactList) => (
                          <MenuItem key={contactList.id} value={contactList.id}>
                            {contactList.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </Field>
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={FormControl}
                      variant="outlined"
                      margin="dense"
                      fullWidth
                    >
                      <InputLabel>
                        {i18n.t("campaignModal.form.tagList")}
                      </InputLabel>
                      <Select
                        name="tagListId"
                        value={values.tagListId}
                        label={i18n.t("campaignModal.form.tagList")}
                        disabled={!campaignEditable}
                      >
                        <MenuItem value="Nenhuma">
                          {i18n.t("campaignModal.form.noTag")}
                        </MenuItem>
                        {tagLists.map((tag) => (
                          <MenuItem key={tag.id} value={tag.id}>
                            {tag.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </Field>
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      label={i18n.t("campaignModal.form.scheduledAt")}
                      name="scheduledAt"
                      type="datetime-local"
                      variant="outlined"
                      margin="dense"
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                      disabled={!campaignEditable}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ExtraAttr>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => attachmentFile.current.click()}
                        startIcon={<AttachFileIcon />}
                        disabled={!campaignEditable}
                      >
                        {i18n.t("campaignModal.form.attach")}
                      </Button>
                      {(attachment || campaign.mediaPath) && (
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => setConfirmationOpen(true)}
                          startIcon={<DeleteOutlineIcon />}
                          disabled={!campaignEditable}
                        >
                          {i18n.t("campaignModal.form.remove")}
                        </Button>
                      )}
                    </ExtraAttr>
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
                  {i18n.t("campaignModal.buttons.cancel")}
                </Button>
                <ButtonWrapper>
                  <Button
                    type="submit"
                    color="primary"
                    disabled={isSubmitting || !campaignEditable}
                    variant="contained"
                  >
                    {i18n.t("campaignModal.buttons.ok")}
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

export default CampaignModal;
