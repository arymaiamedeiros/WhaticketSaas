import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { styled } from '@mui/material/styles';
import { green } from '@mui/material/colors';
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Box from "@mui/material/Box";

import { i18n } from "../../translate/i18n";
import QueueSelectSingle from "../../components/QueueSelectSingle";
import api from "../../services/api";
import toastError from "../../errors/toastError";

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

const StyledFormControl = styled(FormControl)(({ theme }) => ({
    margin: theme.spacing(1),
    minWidth: 120,
}));

const PromptSchema = Yup.object().shape({
    name: Yup.string().min(5, "Muito curto!").max(100, "Muito longo!").required("Obrigatório"),
    prompt: Yup.string().min(50, "Muito curto!").required("Descreva o treinamento para Inteligência Artificial"),
    voice: Yup.string().required("Informe o modo para Voz"),
    max_tokens: Yup.number().required("Informe o número máximo de tokens"),
    temperature: Yup.number().required("Informe a temperatura"),
    apikey: Yup.string().required("Informe a API Key"),
    queueId: Yup.number().required("Informe a fila"),
    max_messages: Yup.number().required("Informe o número máximo de mensagens")
});

const PromptModal = ({ open, onClose, promptId }) => {
    const [selectedVoice, setSelectedVoice] = useState("texto");
    const [showApiKey, setShowApiKey] = useState(false);

    const handleToggleApiKey = () => {
        setShowApiKey(!showApiKey);
    };

    const initialState = {
        name: "",
        prompt: "",
        voice: "texto",
        voiceKey: "",
        voiceRegion: "",
        maxTokens: 100,
        temperature: 1,
        apiKey: "",
        queueId: null,
        maxMessages: 10
    };

    const [prompt, setPrompt] = useState(initialState);

    useEffect(() => {
        const fetchPrompt = async () => {
            if (!promptId) {
                setPrompt(initialState);
                return;
            }
            try {
                const { data } = await api.get(`/prompt/${promptId}`);
                setPrompt(prevState => {
                    return { ...prevState, ...data };
                });
                setSelectedVoice(data.voice);
            } catch (err) {
                toastError(err);
            }
        };

        fetchPrompt();
    }, [promptId, open]);

    const handleClose = () => {
        setPrompt(initialState);
        setSelectedVoice("texto");
        onClose();
    };

    const handleChangeVoice = (e) => {
        setSelectedVoice(e.target.value);
    };

    const handleSavePrompt = async values => {
        const promptData = { ...values, voice: selectedVoice };
        if (!values.queueId) {
            toastError("Informe o setor");
            return;
        }
        try {
            if (promptId) {
                await api.put(`/prompt/${promptId}`, promptData);
            } else {
                await api.post("/prompt", promptData);
            }
            toast.success(i18n.t("promptModal.success"));
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
                maxWidth="md"
                scroll="paper"
                fullWidth
            >
                <DialogTitle id="form-dialog-title">
                    {promptId
                        ? `${i18n.t("promptModal.title.edit")}`
                        : `${i18n.t("promptModal.title.add")}`}
                </DialogTitle>
                <Formik
                    initialValues={prompt}
                    enableReinitialize={true}
                    onSubmit={(values, actions) => {
                        setTimeout(() => {
                            handleSavePrompt(values);
                            actions.setSubmitting(false);
                        }, 400);
                    }}
                >
                    {({ touched, errors, isSubmitting, values }) => (
                        <Form style={{ width: "100%" }}>
                            <DialogContent dividers>
                                <Field
                                    as={TextField}
                                    label={i18n.t("promptModal.form.name")}
                                    name="name"
                                    error={touched.name && Boolean(errors.name)}
                                    helperText={touched.name && errors.name}
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth
                                />
                                <StyledFormControl fullWidth margin="dense" variant="outlined">
                                    <Field
                                        as={TextField}
                                        label={i18n.t("promptModal.form.apikey")}
                                        name="apiKey"
                                        type={showApiKey ? 'text' : 'password'}
                                        error={touched.apiKey && Boolean(errors.apiKey)}
                                        helperText={touched.apiKey && errors.apiKey}
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={handleToggleApiKey}>
                                                        {showApiKey ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </StyledFormControl>
                                <Field
                                    as={TextField}
                                    label={i18n.t("promptModal.form.prompt")}
                                    name="prompt"
                                    error={touched.prompt && Boolean(errors.prompt)}
                                    helperText={touched.prompt && errors.prompt}
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth
                                    rows={10}
                                    multiline={true}
                                />
                                <QueueSelectSingle />
                                <MultFieldLine>
                                    <StyledFormControl fullWidth margin="dense" variant="outlined">
                                        <InputLabel>{i18n.t("promptModal.form.voice")}</InputLabel>
                                        <Select
                                            id="type-select"
                                            label={i18n.t("promptModal.form.voice")}
                                            name="voice"
                                            value={selectedVoice}
                                            onChange={handleChangeVoice}
                                        >
                                            <MenuItem value="texto">Texto</MenuItem>
                                            <MenuItem value="pt-BR-FranciscaNeural">Francisa</MenuItem>
                                            <MenuItem value="pt-BR-AntonioNeural">Antônio</MenuItem>
                                            <MenuItem value="pt-BR-BrendaNeural">Brenda</MenuItem>
                                            <MenuItem value="pt-BR-DonatoNeural">Donato</MenuItem>
                                            <MenuItem value="pt-BR-ElzaNeural">Elza</MenuItem>
                                            <MenuItem value="pt-BR-FabioNeural">Fábio</MenuItem>
                                            <MenuItem value="pt-BR-GiovannaNeural">Giovanna</MenuItem>
                                            <MenuItem value="pt-BR-HumbertoNeural">Humberto</MenuItem>
                                        </Select>
                                    </StyledFormControl>
                                </MultFieldLine>
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    onClick={handleClose}
                                    color="secondary"
                                    disabled={isSubmitting}
                                    variant="outlined"
                                >
                                    {i18n.t("promptModal.buttons.cancel")}
                                </Button>
                                <ButtonWrapper>
                                    <Button
                                        type="submit"
                                        color="primary"
                                        disabled={isSubmitting}
                                        variant="contained"
                                    >
                                        {i18n.t("promptModal.buttons.ok")}
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

export default PromptModal;
