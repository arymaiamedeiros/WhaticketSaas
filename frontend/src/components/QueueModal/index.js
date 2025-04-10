import React, { useState, useEffect, useRef } from "react";
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
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
} from "@mui/material";
import { Colorize } from "@mui/icons-material";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import ColorPicker from "../ColorPicker";
import { QueueOptions } from "../QueueOptions";
import SchedulesForm from "../SchedulesForm";

const Root = styled('div')({
  display: "flex",
  flexWrap: "wrap",
});

const StyledTextField = styled(TextField)({
  marginRight: 8,
  flex: 1,
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

const StyledFormControl = styled(FormControl)({
  margin: 8,
  minWidth: 120,
});

const ColorAdornment = styled('div')({
  width: 20,
  height: 20,
});

const QueueSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  color: Yup.string().min(3, "Too Short!").max(9, "Too Long!").required(),
  greetingMessage: Yup.string(),
});

const QueueModal = ({ open, onClose, queueId }) => {
  const initialState = {
    name: "",
    color: "",
    greetingMessage: "",
    outOfHoursMessage: "",
    orderQueue: "",
    integrationId: "",
    promptId: ""
  };

  const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);
  const [queue, setQueue] = useState(initialState);
  const [tab, setTab] = useState(0);
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);
  const greetingRef = useRef();
  const [integrations, setIntegrations] = useState([]);

  const [schedules, setSchedules] = useState([
    { weekday: "Segunda-feira", weekdayEn: "monday", startTime: "08:00", endTime: "18:00", },
    { weekday: "Terça-feira", weekdayEn: "tuesday", startTime: "08:00", endTime: "18:00", },
    { weekday: "Quarta-feira", weekdayEn: "wednesday", startTime: "08:00", endTime: "18:00", },
    { weekday: "Quinta-feira", weekdayEn: "thursday", startTime: "08:00", endTime: "18:00", },
    { weekday: "Sexta-feira", weekdayEn: "friday", startTime: "08:00", endTime: "18:00", },
    { weekday: "Sábado", weekdayEn: "saturday", startTime: "08:00", endTime: "12:00", },
    { weekday: "Domingo", weekdayEn: "sunday", startTime: "00:00", endTime: "00:00", },
  ]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [prompts, setPrompts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/prompt");
        setPrompts(data.prompts);
      } catch (err) {
        toastError(err);
      }
    })();
  }, []);

  useEffect(() => {
    api.get(`/settings`).then(({ data }) => {
      if (Array.isArray(data)) {
        const scheduleType = data.find((d) => d.key === "scheduleType");
        if (scheduleType) {
          setSchedulesEnabled(scheduleType.value === "queue");
        }
      }
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/queueIntegration");
        setIntegrations(data.queueIntegrations);
      } catch (err) {
        toastError(err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!queueId) return;
      try {
        const { data } = await api.get(`/queue/${queueId}`);
        setQueue((prevState) => {
          return { ...prevState, ...data };
        });
        data.promptId ? setSelectedPrompt(data.promptId) : setSelectedPrompt(null);
        setSchedules(data.schedules);
      } catch (err) {
        toastError(err);
      }
    })();

    return () => {
      setQueue({
        name: "",
        color: "",
        greetingMessage: "",
        outOfHoursMessage: "",
        orderQueue: "",
        integrationId: ""
      });
    };
  }, [queueId, open]);

  const handleClose = () => {
    onClose();
    setQueue(initialState);
  };

  const handleSaveQueue = async (values) => {
    try {
      if (queueId) {
        await api.put(`/queue/${queueId}`, {
          ...values, schedules, promptId: selectedPrompt ? selectedPrompt : null
        });
      } else {
        await api.post("/queue", {
          ...values, schedules, promptId: selectedPrompt ? selectedPrompt : null
        });
      }
      toast.success("Queue saved successfully");
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  const handleSaveSchedules = async (values) => {
    toast.success("Clique em salvar para registar as alterações");
    setSchedules(values);
    setTab(0);
  };

  const handleChangePrompt = (e) => {
    setSelectedPrompt(e.target.value);
  };

  return (
    <Root>
      <Dialog
        maxWidth="md"
        fullWidth={true}
        open={open}
        onClose={handleClose}
        scroll="paper"
      >
        <DialogTitle>
          {queueId
            ? `${i18n.t("queueModal.title.edit")}`
            : `${i18n.t("queueModal.title.add")}`}
        </DialogTitle>
        <Tabs
          value={tab}
          indicatorColor="primary"
          textColor="primary"
          onChange={(_, v) => setTab(v)}
          aria-label="disabled tabs example"
        >
          <Tab label="Dados da Fila" />
          {schedulesEnabled && <Tab label="Horários de Atendimento" />}
        </Tabs>
        {tab === 0 && (
          <Paper>
            <Formik
              initialValues={queue}
              enableReinitialize={true}
              validationSchema={QueueSchema}
              onSubmit={(values, actions) => {
                setTimeout(() => {
                  handleSaveQueue(values);
                  actions.setSubmitting(false);
                }, 400);
              }}
            >
              {({ touched, errors, isSubmitting, values }) => (
                <Form>
                  <DialogContent dividers>
                    <Field
                      as={StyledTextField}
                      label={i18n.t("queueModal.form.name")}
                      autoFocus
                      name="name"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      variant="outlined"
                      margin="dense"
                      fullWidth
                    />
                    <Field
                      as={StyledTextField}
                      label={i18n.t("queueModal.form.color")}
                      name="color"
                      id="color"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ColorAdornment
                              style={{ backgroundColor: values.color }}
                            />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => setColorPickerModalOpen(true)}
                            >
                              <Colorize />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      variant="outlined"
                      margin="dense"
                    />
                    <Field
                      as={StyledTextField}
                      label={i18n.t("queueModal.form.greetingMessage")}
                      name="greetingMessage"
                      multiline
                      rows={4}
                      variant="outlined"
                      margin="dense"
                      fullWidth
                      inputRef={greetingRef}
                    />
                    <Field
                      as={StyledTextField}
                      label={i18n.t("queueModal.form.outOfHoursMessage")}
                      name="outOfHoursMessage"
                      multiline
                      rows={4}
                      variant="outlined"
                      margin="dense"
                      fullWidth
                    />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Field
                          as={StyledFormControl}
                          variant="outlined"
                          margin="dense"
                          fullWidth
                        >
                          <InputLabel>
                            {i18n.t("queueModal.form.orderQueue")}
                          </InputLabel>
                          <Select
                            name="orderQueue"
                            label={i18n.t("queueModal.form.orderQueue")}
                            value={values.orderQueue}
                          >
                            <MenuItem value={0}>
                              {i18n.t("queueModal.form.orderQueueOptions.0")}
                            </MenuItem>
                            <MenuItem value={1}>
                              {i18n.t("queueModal.form.orderQueueOptions.1")}
                            </MenuItem>
                            <MenuItem value={2}>
                              {i18n.t("queueModal.form.orderQueueOptions.2")}
                            </MenuItem>
                          </Select>
                        </Field>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Field
                          as={StyledFormControl}
                          variant="outlined"
                          margin="dense"
                          fullWidth
                        >
                          <InputLabel>
                            {i18n.t("queueModal.form.integration")}
                          </InputLabel>
                          <Select
                            name="integrationId"
                            label={i18n.t("queueModal.form.integration")}
                            value={values.integrationId}
                          >
                            <MenuItem value={""}>
                              {i18n.t("queueModal.form.integrationOptions.0")}
                            </MenuItem>
                            {integrations.map((integration) => (
                              <MenuItem
                                key={integration.id}
                                value={integration.id}
                              >
                                {integration.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </Field>
                      </Grid>
                    </Grid>
                    <Field
                      as={StyledFormControl}
                      variant="outlined"
                      margin="dense"
                      fullWidth
                    >
                      <InputLabel>
                        {i18n.t("queueModal.form.prompt")}
                      </InputLabel>
                      <Select
                        name="promptId"
                        label={i18n.t("queueModal.form.prompt")}
                        value={selectedPrompt}
                        onChange={handleChangePrompt}
                      >
                        <MenuItem value={null}>
                          {i18n.t("queueModal.form.promptOptions.0")}
                        </MenuItem>
                        {prompts.map((prompt) => (
                          <MenuItem
                            key={prompt.id}
                            value={prompt.id}
                          >
                            {prompt.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </Field>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                      {i18n.t("queueModal.buttons.cancel")}
                    </Button>
                    <ButtonWrapper>
                      <Button
                        type="submit"
                        color="primary"
                        variant="contained"
                        disabled={isSubmitting}
                      >
                        {i18n.t("queueModal.buttons.ok")}
                      </Button>
                      {isSubmitting && <ButtonProgress size={24} />}
                    </ButtonWrapper>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          </Paper>
        )}
        {tab === 1 && (
          <SchedulesForm
            schedules={schedules}
            handleSaveSchedules={handleSaveSchedules}
          />
        )}
        <ColorPicker
          modalOpen={colorPickerModalOpen}
          onChange={(color) => {
            setQueue((prev) => ({ ...prev, color }));
            setColorPickerModalOpen(false);
          }}
          onClose={() => setColorPickerModalOpen(false)}
        />
      </Dialog>
    </Root>
  );
};

export default QueueModal;
