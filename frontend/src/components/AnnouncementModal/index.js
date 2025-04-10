import React, { useState, useEffect, useRef } from "react";
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
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import IconButton from "@mui/material/IconButton";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Box from "@mui/material/Box";

import { i18n } from "../../translate/i18n";
import { head } from "lodash";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import ConfirmationModal from "../ConfirmationModal";

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

const ColorAdornment = styled('div')({
    width: 20,
    height: 20,
});

const AnnouncementSchema = Yup.object().shape({
    title: Yup.string().required("Obrigatório"),
    text: Yup.string().required("Obrigatório"),
});

const AnnouncementModal = ({ open, onClose, announcementId, reload }) => {
    const initialState = {
        title: "",
        text: "",
        priority: 3,
        status: true,
    };

    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [announcement, setAnnouncement] = useState(initialState);
    const [attachment, setAttachment] = useState(null);
    const attachmentFile = useRef(null);

    useEffect(() => {
        try {
            (async () => {
                if (!announcementId) return;

                const { data } = await api.get(`/announcements/${announcementId}`);
                setAnnouncement((prevState) => {
                    return { ...prevState, ...data };
                });
            })();
        } catch (err) {
            toastError(err);
        }
    }, [announcementId, open]);

    const handleClose = () => {
        setAnnouncement(initialState);
        setAttachment(null);
        onClose();
    };

    const handleAttachmentFile = (e) => {
        const file = head(e.target.files);
        if (file) {
            setAttachment(file);
        }
    };

    const handleSaveAnnouncement = async (values) => {
        const announcementData = { ...values };
        try {
            if (announcementId) {
                await api.put(`/announcements/${announcementId}`, announcementData);
                if (attachment != null) {
                    const formData = new FormData();
                    formData.append("file", attachment);
                    await api.post(
                        `/announcements/${announcementId}/media-upload`,
                        formData
                    );
                }
            } else {
                const { data } = await api.post("/announcements", announcementData);
                if (attachment != null) {
                    const formData = new FormData();
                    formData.append("file", attachment);
                    await api.post(`/announcements/${data.id}/media-upload`, formData);
                }
            }
            toast.success(i18n.t("announcements.toasts.success"));
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

        if (announcement.mediaPath) {
            await api.delete(`/announcements/${announcement.id}/media-upload`);
            setAnnouncement((prev) => ({
                ...prev,
                mediaPath: null,
            }));
            toast.success(i18n.t("announcements.toasts.deleted"));
            if (typeof reload == "function") {
                reload();
            }
        }
    };

    return (
        <Root>
            <ConfirmationModal
                title={i18n.t("announcements.confirmationModal.deleteTitle")}
                open={confirmationOpen}
                onClose={() => setConfirmationOpen(false)}
                onConfirm={deleteMedia}
            >
                {i18n.t("announcements.confirmationModal.deleteMessage")}
            </ConfirmationModal>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="xs"
                fullWidth
                scroll="paper"
            >
                <DialogTitle id="form-dialog-title">
                    {announcementId
                        ? `${i18n.t("announcements.dialog.edit")}`
                        : `${i18n.t("announcements.dialog.add")}`}
                </DialogTitle>
                <div style={{ display: "none" }}>
                    <input
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        ref={attachmentFile}
                        onChange={handleAttachmentFile}
                    />
                </div>
                <Formik
                    initialValues={announcement}
                    enableReinitialize={true}
                    validationSchema={AnnouncementSchema}
                    onSubmit={(values, actions) => {
                        setTimeout(() => {
                            handleSaveAnnouncement(values);
                            actions.setSubmitting(false);
                        }, 400);
                    }}
                >
                    {({ touched, errors, isSubmitting, values }) => (
                        <Form>
                            <DialogContent dividers>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Field
                                            as={TextField}
                                            label={i18n.t("announcements.dialog.form.title")}
                                            name="title"
                                            error={touched.title && Boolean(errors.title)}
                                            helperText={touched.title && errors.title}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Field
                                            as={TextField}
                                            label={i18n.t("announcements.dialog.form.text")}
                                            name="text"
                                            error={touched.text && Boolean(errors.text)}
                                            helperText={touched.text && errors.text}
                                            variant="outlined"
                                            margin="dense"
                                            multiline={true}
                                            rows={7}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <StyledFormControl variant="outlined" margin="dense" fullWidth>
                                            <InputLabel id="status-selection-label">
                                                {i18n.t("announcements.dialog.form.status")}
                                            </InputLabel>
                                            <Field
                                                as={Select}
                                                label={i18n.t("announcements.dialog.form.status")}
                                                placeholder={i18n.t("announcements.dialog.form.status")}
                                                labelId="status-selection-label"
                                                id="status"
                                                name="status"
                                                error={touched.status && Boolean(errors.status)}
                                            >
                                                <MenuItem value={true}>
                                                    {i18n.t("announcements.dialog.form.active")}
                                                </MenuItem>
                                                <MenuItem value={false}>
                                                    {i18n.t("announcements.dialog.form.inactive")}
                                                </MenuItem>
                                            </Field>
                                        </StyledFormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <StyledFormControl variant="outlined" margin="dense" fullWidth>
                                            <InputLabel id="priority-selection-label">
                                                {i18n.t("announcements.dialog.form.priority")}
                                            </InputLabel>
                                            <Field
                                                as={Select}
                                                label={i18n.t("announcements.dialog.form.priority")}
                                                placeholder={i18n.t("announcements.dialog.form.priority")}
                                                labelId="priority-selection-label"
                                                id="priority"
                                                name="priority"
                                                error={touched.priority && Boolean(errors.priority)}
                                            >
                                                <MenuItem value={1}>
                                                    <MultFieldLine>
                                                        <ColorAdornment
                                                            style={{ backgroundColor: "#ff0000" }}
                                                        />
                                                        {i18n.t("announcements.dialog.form.high")}
                                                    </MultFieldLine>
                                                </MenuItem>
                                                <MenuItem value={2}>
                                                    <MultFieldLine>
                                                        <ColorAdornment
                                                            style={{ backgroundColor: "#ffa500" }}
                                                        />
                                                        {i18n.t("announcements.dialog.form.medium")}
                                                    </MultFieldLine>
                                                </MenuItem>
                                                <MenuItem value={3}>
                                                    <MultFieldLine>
                                                        <ColorAdornment
                                                            style={{ backgroundColor: "#008000" }}
                                                        />
                                                        {i18n.t("announcements.dialog.form.low")}
                                                    </MultFieldLine>
                                                </MenuItem>
                                            </Field>
                                        </StyledFormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <MultFieldLine>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => attachmentFile.current.click()}
                                                startIcon={<AttachFileIcon />}
                                            >
                                                {i18n.t("announcements.dialog.form.attach")}
                                            </Button>
                                            {(attachment || announcement.mediaPath) && (
                                                <Button
                                                    variant="outlined"
                                                    color="secondary"
                                                    onClick={() => setConfirmationOpen(true)}
                                                    startIcon={<DeleteOutlineIcon />}
                                                >
                                                    {i18n.t("announcements.dialog.form.remove")}
                                                </Button>
                                            )}
                                        </MultFieldLine>
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
                                    {i18n.t("announcements.dialog.buttons.cancel")}
                                </Button>
                                <ButtonWrapper>
                                    <Button
                                        type="submit"
                                        color="primary"
                                        disabled={isSubmitting}
                                        variant="contained"
                                    >
                                        {i18n.t("announcements.dialog.buttons.ok")}
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

export default AnnouncementModal;
