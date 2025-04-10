import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { styled } from '@mui/material/styles';
import { green } from '@mui/material/colors';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const Root = styled('div')({
    display: "flex",
    flexWrap: "wrap",
});

const MultFieldLine = styled(Box)(({ theme }) => ({
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

const ContactListSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, "Too Short!")
        .max(50, "Too Long!")
        .required("Required"),
});

const ContactListModal = ({ open, onClose, contactListId }) => {
    const initialState = {
        name: "",
    };

    const [contactList, setContactList] = useState(initialState);

    useEffect(() => {
        const fetchContactList = async () => {
            if (!contactListId) return;
            try {
                const { data } = await api.get(`/contact-lists/${contactListId}`);
                setContactList((prevState) => {
                    return { ...prevState, ...data };
                });
            } catch (err) {
                toastError(err);
            }
        };

        fetchContactList();
    }, [contactListId, open]);

    const handleClose = () => {
        onClose();
        setContactList(initialState);
    };

    const handleSaveContactList = async (values) => {
        const contactListData = { ...values };
        try {
            if (contactListId) {
                await api.put(`/contact-lists/${contactListId}`, contactListData);
            } else {
                await api.post("/contact-lists", contactListData);
            }
            toast.success(i18n.t("contactList.dialog"));
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
                maxWidth="xs"
                fullWidth
                scroll="paper"
            >
                <DialogTitle id="form-dialog-title">
                    {contactListId
                        ? `${i18n.t("contactLists.dialog.edit")}`
                        : `${i18n.t("contactLists.dialog.add")}`}
                </DialogTitle>
                <Formik
                    initialValues={contactList}
                    enableReinitialize={true}
                    validationSchema={ContactListSchema}
                    onSubmit={(values, actions) => {
                        setTimeout(() => {
                            handleSaveContactList(values);
                            actions.setSubmitting(false);
                        }, 400);
                    }}
                >
                    {({ touched, errors, isSubmitting }) => (
                        <Form>
                            <DialogContent dividers>
                                <MultFieldLine>
                                    <Field
                                        as={TextField}
                                        label={i18n.t("contactLists.dialog.name")}
                                        autoFocus
                                        name="name"
                                        error={touched.name && Boolean(errors.name)}
                                        helperText={touched.name && errors.name}
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                    />
                                </MultFieldLine>
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    onClick={handleClose}
                                    color="secondary"
                                    disabled={isSubmitting}
                                    variant="outlined"
                                >
                                    {i18n.t("contactLists.dialog.cancel")}
                                </Button>
                                <ButtonWrapper>
                                    <Button
                                        type="submit"
                                        color="primary"
                                        disabled={isSubmitting}
                                        variant="contained"
                                    >
                                        {contactListId
                                            ? `${i18n.t("contactLists.dialog.okEdit")}`
                                            : `${i18n.t("contactLists.dialog.okAdd")}`}
                                        {isSubmitting && <ButtonProgress size={24} />}
                                    </Button>
                                </ButtonWrapper>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </Root>
    );
};

export default ContactListModal;
