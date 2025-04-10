import React, { useState, useEffect } from "react";
import { styled } from '@mui/material/styles';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Box,
    Switch,
    FormControlLabel,
    Typography
} from "@mui/material";
import { Formik, Form, Field } from 'formik';
import ButtonWithSpinner from "../ButtonWithSpinner";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        width: '100%',
        maxWidth: 800,
        margin: theme.spacing(2),
    },
}));

const StyledPaper = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
}));

const FeatureSection = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
}));

const PlanModal = ({ open, onClose, plan, onSave }) => {
    const [loading, setLoading] = useState(false);
    const [initialValues, setInitialValues] = useState({
        name: '',
        users: 0,
        connections: 0,
        queues: 0,
        value: 0,
        useCampaigns: true,
        useSchedules: true,
        useInternalChat: true,
        useExternalApi: true,
        useKanban: true,
        useOpenAi: true,
        useIntegrations: true,
    });

    useEffect(() => {
        if (plan) {
            setInitialValues({
                name: plan.name || '',
                users: plan.users || 0,
                connections: plan.connections || 0,
                queues: plan.queues || 0,
                value: plan.value || 0,
                useCampaigns: plan.useCampaigns !== false,
                useSchedules: plan.useSchedules !== false,
                useInternalChat: plan.useInternalChat !== false,
                useExternalApi: plan.useExternalApi !== false,
                useKanban: plan.useKanban !== false,
                useOpenAi: plan.useOpenAi !== false,
                useIntegrations: plan.useIntegrations !== false,
            });
        } else {
            setInitialValues({
                name: '',
                users: 0,
                connections: 0,
                queues: 0,
                value: 0,
                useCampaigns: true,
                useSchedules: true,
                useInternalChat: true,
                useExternalApi: true,
                useKanban: true,
                useOpenAi: true,
                useIntegrations: true,
            });
        }
    }, [plan]);

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            if (plan) {
                await api.put(`/plans/${plan.id}`, values);
                toast.success("Plano atualizado com sucesso!");
            } else {
                await api.post("/plans", values);
                toast.success("Plano criado com sucesso!");
            }
            onSave();
            onClose();
        } catch (err) {
            toastError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <StyledDialog open={open} onClose={onClose}>
            <DialogTitle>
                {plan ? "Editar Plano" : "Novo Plano"}
            </DialogTitle>
            <Formik
                initialValues={initialValues}
                enableReinitialize
                onSubmit={handleSubmit}
            >
                {({ values, handleChange, setFieldValue }) => (
                    <Form>
                        <DialogContent>
                            <StyledPaper>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Field
                                            as={TextField}
                                            label="Nome"
                                            name="name"
                                            variant="outlined"
                                            fullWidth
                                            margin="dense"
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <Field
                                            as={TextField}
                                            label="Usuários"
                                            name="users"
                                            type="number"
                                            variant="outlined"
                                            fullWidth
                                            margin="dense"
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <Field
                                            as={TextField}
                                            label="Conexões"
                                            name="connections"
                                            type="number"
                                            variant="outlined"
                                            fullWidth
                                            margin="dense"
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <Field
                                            as={TextField}
                                            label="Filas"
                                            name="queues"
                                            type="number"
                                            variant="outlined"
                                            fullWidth
                                            margin="dense"
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <Field
                                            as={TextField}
                                            label="Valor"
                                            name="value"
                                            type="number"
                                            variant="outlined"
                                            fullWidth
                                            margin="dense"
                                        />
                                    </Grid>
                                </Grid>

                                <FeatureSection>
                                    <Typography variant="h6" gutterBottom>
                                        Recursos
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6} md={4}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={values.useCampaigns}
                                                        onChange={(e) => setFieldValue('useCampaigns', e.target.checked)}
                                                        color="primary"
                                                    />
                                                }
                                                label="Campanhas"
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6} md={4}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={values.useSchedules}
                                                        onChange={(e) => setFieldValue('useSchedules', e.target.checked)}
                                                        color="primary"
                                                    />
                                                }
                                                label="Agendamentos"
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6} md={4}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={values.useInternalChat}
                                                        onChange={(e) => setFieldValue('useInternalChat', e.target.checked)}
                                                        color="primary"
                                                    />
                                                }
                                                label="Chat Interno"
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6} md={4}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={values.useExternalApi}
                                                        onChange={(e) => setFieldValue('useExternalApi', e.target.checked)}
                                                        color="primary"
                                                    />
                                                }
                                                label="API Externa"
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6} md={4}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={values.useKanban}
                                                        onChange={(e) => setFieldValue('useKanban', e.target.checked)}
                                                        color="primary"
                                                    />
                                                }
                                                label="Kanban"
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6} md={4}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={values.useOpenAi}
                                                        onChange={(e) => setFieldValue('useOpenAi', e.target.checked)}
                                                        color="primary"
                                                    />
                                                }
                                                label="Open.Ai"
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6} md={4}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={values.useIntegrations}
                                                        onChange={(e) => setFieldValue('useIntegrations', e.target.checked)}
                                                        color="primary"
                                                    />
                                                }
                                                label="Integrações"
                                            />
                                        </Grid>
                                    </Grid>
                                </FeatureSection>
                            </StyledPaper>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={onClose} color="secondary">
                                Cancelar
                            </Button>
                            <ButtonWithSpinner
                                variant="contained"
                                color="primary"
                                type="submit"
                                loading={loading}
                            >
                                {plan ? "Atualizar" : "Criar"}
                            </ButtonWithSpinner>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </StyledDialog>
    );
};

export default PlanModal; 
