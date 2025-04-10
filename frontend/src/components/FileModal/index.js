import React, { useState, useEffect, useContext } from "react";
import { styled } from '@mui/material/styles';
import * as Yup from "yup";
import {
    Formik,
    Form,
    Field,
    FieldArray
} from "formik";
import { toast } from "react-toastify";

import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    TextField,
    Typography,
    IconButton
} from "@mui/material";
import { DeleteOutline as DeleteOutlineIcon, AttachFile as AttachFileIcon } from "@mui/icons-material";
import { green } from "@mui/material/colors";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";

const Root = styled('div')({
    display: "flex",
    flexWrap: "wrap",
    gap: 4
});

const MultFieldLine = styled('div')(({ theme }) => ({
    display: "flex",
    "& > *:not(:last-child)": {
        marginRight: theme.spacing(1),
    },
}));

const StyledTextField = styled(TextField)({
    marginRight: 8,
    flex: 1,
});

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

const StyledFormControl = styled('div')(({ theme }) => ({
    margin: theme.spacing(1),
    minWidth: 2000,
}));

const FileListSchema = Yup.object().shape({
    name: Yup.string()
        .min(3, "nome muito curto")
        .required("Obrigatório"),
    message: Yup.string()
        .required("Obrigatório")
});

const FilesModal = ({ open, onClose, fileListId, reload }) => {
    const { user } = useContext(AuthContext);
    const [files, setFiles] = useState([]);
    const [selectedFileNames, setSelectedFileNames] = useState([]);

    const initialState = {
        name: "",
        message: "",
        options: [{ name: "", path: "", mediaType: "" }],
    };

    const [fileList, setFileList] = useState(initialState);

    useEffect(() => {
        try {
            (async () => {
                if (!fileListId) return;

                const { data } = await api.get(`/files/${fileListId}`);
                setFileList(data);
            })()
        } catch (err) {
            toastError(err);
        }
    }, [fileListId, open]);

    const handleClose = () => {
        setFileList(initialState);
        setFiles([]);
        onClose();
    };

    const handleSaveFileList = async (values) => {
        const uploadFiles = async (options, filesOptions, id) => {
            const formData = new FormData();
            formData.append("fileId", id);
            formData.append("typeArch", "fileList")
            filesOptions.forEach((fileOption, index) => {
                if (fileOption.file) {
                    formData.append("files", fileOption.file);
                    formData.append("mediaType", fileOption.file.type)
                    formData.append("name", options[index].name);
                    formData.append("id", options[index].id);
                }
            });

            try {
                const { data } = await api.post(`/files/uploadList/${id}`, formData);
                setFiles([]);
                return data;
            } catch (err) {
                toastError(err);
            }
            return null;
        }

        const fileData = { ...values, userId: user.id };

        try {
            if (fileListId) {
                const { data } = await api.put(`/files/${fileListId}`, fileData)
                if (data.options.length > 0)
                    uploadFiles(data.options, values.options, fileListId)
            } else {
                const { data } = await api.post("/files", fileData);
                if (data.options.length > 0)
                    uploadFiles(data.options, values.options, data.id)
            }
            toast.success(i18n.t("fileModal.success"));
            if (typeof reload == 'function') {
                reload();
            }
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
                fullWidth
                scroll="paper">
                <DialogTitle id="form-dialog-title">
                    {(fileListId ? `${i18n.t("fileModal.title.edit")}` : `${i18n.t("fileModal.title.add")}`)}
                </DialogTitle>
                <Formik
                    initialValues={fileList}
                    enableReinitialize={true}
                    validationSchema={FileListSchema}
                    onSubmit={(values, actions) => {
                        setTimeout(() => {
                            handleSaveFileList(values);
                            actions.setSubmitting(false);
                        }, 400);
                    }}
                >
                    {({ touched, errors, isSubmitting, values }) => (
                        <Form>
                            <DialogContent dividers>
                                <MultFieldLine>
                                    <Field
                                        as={StyledTextField}
                                        label={i18n.t("fileModal.form.name")}
                                        name="name"
                                        error={touched.name && Boolean(errors.name)}
                                        helperText={touched.name && errors.name}
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                    />
                                </MultFieldLine>
                                <br />
                                <MultFieldLine>
                                    <Field
                                        as={StyledTextField}
                                        label={i18n.t("fileModal.form.message")}
                                        type="message"
                                        multiline
                                        minRows={5}
                                        fullWidth
                                        name="message"
                                        error={
                                            touched.message && Boolean(errors.message)
                                        }
                                        helperText={
                                            touched.message && errors.message
                                        }
                                        variant="outlined"
                                        margin="dense"
                                    />
                                </MultFieldLine>
                                <Typography
                                    sx={{ mb: 1, mt: 3 }}
                                    variant="subtitle1"
                                >
                                    {i18n.t("fileModal.form.fileOptions")}
                                </Typography>

                                <FieldArray name="options">
                                    {({ push, remove }) => (
                                        <>
                                            {values.options &&
                                                values.options.length > 0 &&
                                                values.options.map((info, index) => (
                                                    <ExtraAttr key={`${index}-info`}>
                                                        <Grid container spacing={0}>
                                                            <Grid item xs={6} md={10}>
                                                                <Field
                                                                    as={StyledTextField}
                                                                    label={i18n.t("fileModal.form.fileName")}
                                                                    name={`options.${index}.name`}
                                                                    variant="outlined"
                                                                    margin="dense"
                                                                    fullWidth
                                                                />
                                                            </Grid>
                                                            <Grid item xs={6} md={2}>
                                                                <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
                                                                    <input
                                                                        type="file"
                                                                        id={`file-${index}`}
                                                                        style={{ display: "none" }}
                                                                        onChange={(e) => {
                                                                            const file = e.target.files[0];
                                                                            if (file) {
                                                                                values.options[index].file = file;
                                                                                values.options[index].mediaType = file.type;
                                                                                setSelectedFileNames(prev => {
                                                                                    const newNames = [...prev];
                                                                                    newNames[index] = file.name;
                                                                                    return newNames;
                                                                                });
                                                                            }
                                                                        }}
                                                                    />
                                                                    <label htmlFor={`file-${index}`}>
                                                                        <IconButton
                                                                            component="span"
                                                                            color="primary"
                                                                        >
                                                                            <AttachFileIcon />
                                                                        </IconButton>
                                                                    </label>
                                                                    {selectedFileNames[index] && (
                                                                        <Typography variant="body2" sx={{ ml: 1 }}>
                                                                            {selectedFileNames[index]}
                                                                        </Typography>
                                                                    )}
                                                                    <IconButton
                                                                        onClick={() => {
                                                                            remove(index);
                                                                            setSelectedFileNames(prev => {
                                                                                const newNames = [...prev];
                                                                                newNames.splice(index, 1);
                                                                                return newNames;
                                                                            });
                                                                        }}
                                                                        color="secondary"
                                                                    >
                                                                        <DeleteOutlineIcon />
                                                                    </IconButton>
                                                                </Box>
                                                            </Grid>
                                                        </Grid>
                                                    </ExtraAttr>
                                                ))}
                                            <Box sx={{ mt: 2 }}>
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={() => {
                                                        push({ name: "", path: "", mediaType: "" });
                                                        setSelectedFileNames(prev => [...prev, ""]);
                                                    }}
                                                >
                                                    {i18n.t("fileModal.buttons.addFile")}
                                                </Button>
                                            </Box>
                                        </>
                                    )}
                                </FieldArray>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClose} color="secondary">
                                    {i18n.t("fileModal.buttons.cancel")}
                                </Button>
                                <ButtonWrapper>
                                    <Button
                                        type="submit"
                                        color="primary"
                                        variant="contained"
                                        disabled={isSubmitting}
                                    >
                                        {i18n.t("fileModal.buttons.ok")}
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

export default FilesModal;
