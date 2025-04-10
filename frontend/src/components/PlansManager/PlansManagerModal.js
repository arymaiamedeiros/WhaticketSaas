import React from "react";
import { styled } from '@mui/material/styles';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Typography,
    Box
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { i18n } from "../../../translate/i18n";

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        minWidth: 500,
        [theme.breakpoints.down('sm')]: {
            minWidth: '90%',
        },
    },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
    padding: theme.spacing(3),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

const PlansManagerModal = ({ open, onClose, onSubmit, initialData }) => {
    const formik = useFormik({
        initialValues: {
            name: initialData?.name || "",
            users: initialData?.users || 1,
            connections: initialData?.connections || 1,
            queues: initialData?.queues || 1,
            value: initialData?.value || 0,
            isActive: initialData?.isActive ?? true,
        },
        validationSchema: Yup.object({
            name: Yup.string().required(i18n.t("plansManager.validation.required")),
            users: Yup.number()
                .required(i18n.t("plansManager.validation.required"))
                .min(1, i18n.t("plansManager.validation.minValue")),
            connections: Yup.number()
                .required(i18n.t("plansManager.validation.required"))
                .min(1, i18n.t("plansManager.validation.minValue")),
            queues: Yup.number()
                .required(i18n.t("plansManager.validation.required"))
                .min(1, i18n.t("plansManager.validation.minValue")),
            value: Yup.number()
                .required(i18n.t("plansManager.validation.required"))
                .min(0, i18n.t("plansManager.validation.minValue")),
        }),
        onSubmit: (values) => {
            onSubmit(values);
            onClose();
        },
    });

    return (
        <StyledDialog open={open} onClose={onClose}>
            <StyledDialogTitle>
                {initialData
                    ? i18n.t("plansManager.modal.editTitle")
                    : i18n.t("plansManager.modal.newTitle")}
            </StyledDialogTitle>
            <form onSubmit={formik.handleSubmit}>
                <StyledDialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <StyledTextField
                                fullWidth
                                id="name"
                                name="name"
                                label={i18n.t("plansManager.fields.name")}
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                error={formik.touched.name && Boolean(formik.errors.name)}
                                helperText={formik.touched.name && formik.errors.name}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <StyledTextField
                                fullWidth
                                id="users"
                                name="users"
                                type="number"
                                label={i18n.t("plansManager.fields.users")}
                                value={formik.values.users}
                                onChange={formik.handleChange}
                                error={formik.touched.users && Boolean(formik.errors.users)}
                                helperText={formik.touched.users && formik.errors.users}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <StyledTextField
                                fullWidth
                                id="connections"
                                name="connections"
                                type="number"
                                label={i18n.t("plansManager.fields.connections")}
                                value={formik.values.connections}
                                onChange={formik.handleChange}
                                error={formik.touched.connections && Boolean(formik.errors.connections)}
                                helperText={formik.touched.connections && formik.errors.connections}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <StyledTextField
                                fullWidth
                                id="queues"
                                name="queues"
                                type="number"
                                label={i18n.t("plansManager.fields.queues")}
                                value={formik.values.queues}
                                onChange={formik.handleChange}
                                error={formik.touched.queues && Boolean(formik.errors.queues)}
                                helperText={formik.touched.queues && formik.errors.queues}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <StyledTextField
                                fullWidth
                                id="value"
                                name="value"
                                type="number"
                                label={i18n.t("plansManager.fields.value")}
                                value={formik.values.value}
                                onChange={formik.handleChange}
                                error={formik.touched.value && Boolean(formik.errors.value)}
                                helperText={formik.touched.value && formik.errors.value}
                                InputProps={{
                                    startAdornment: (
                                        <Typography color="textSecondary">R$</Typography>
                                    ),
                                }}
                            />
                        </Grid>
                    </Grid>
                </StyledDialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="secondary">
                        {i18n.t("plansManager.buttons.cancel")}
                    </Button>
                    <Button type="submit" color="primary" variant="contained">
                        {i18n.t("plansManager.buttons.save")}
                    </Button>
                </DialogActions>
            </form>
        </StyledDialog>
    );
};

export default PlansManagerModal; 
