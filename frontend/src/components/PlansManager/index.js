import React, { useState, useEffect } from "react";
import { styled } from '@mui/material/styles';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    TextField,
    InputAdornment,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    Box,
    Grid,
    FormControlLabel,
    Switch,
    Tooltip,
    Chip,
    FormControl,
    InputLabel,
    MenuItem,
    Select
} from "@mui/material";
import {
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon
} from "@mui/icons-material";
import { Formik, Form, Field } from 'formik';
import ButtonWithSpinner from "../ButtonWithSpinner";
import ConfirmationModal from "../ConfirmationModal";
import { toast } from "react-toastify";
import usePlans from "../../hooks/usePlans";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import PlanModal from "./PlanModal";

const MainPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
}));

const StyledTable = styled(Table)(({ theme }) => ({
    minWidth: 650,
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    '&.MuiTableCell-head': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    },
}));

const ActionButtons = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
    backgroundColor: status ? theme.palette.success.light : theme.palette.error.light,
    color: status ? theme.palette.success.contrastText : theme.palette.error.contrastText,
}));

export function PlanManagerForm(props) {
    const { onSubmit, onDelete, onCancel, initialValue, loading } = props;

    const [record, setRecord] = useState({
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
        setRecord(initialValue)
    }, [initialValue])

    const handleSubmit = async (data) => {
        onSubmit(data)
    }

    return (
        <Formik
            enableReinitialize
            initialValues={record}
            onSubmit={(values, { resetForm }) =>
                setTimeout(() => {
                    handleSubmit(values)
                    resetForm()
                }, 500)
            }
        >
            {(values) => (
                <Form>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={2}>
                            <Field
                                as={TextField}
                                label={i18n.t("plans.form.name")}
                                name="name"
                                variant="outlined"
                                fullWidth
                                margin="dense"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={1}>
                            <Field
                                as={TextField}
                                label={i18n.t("plans.form.users")}
                                name="users"
                                variant="outlined"
                                fullWidth
                                margin="dense"
                                type="number"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={1}>
                            <Field
                                as={TextField}
                                label={i18n.t("plans.form.connections")}
                                name="connections"
                                variant="outlined"
                                fullWidth
                                margin="dense"
                                type="number"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={1}>
                            <Field
                                as={TextField}
                                label="Filas"
                                name="queues"
                                variant="outlined"
                                fullWidth
                                margin="dense"
                                type="number"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={1}>
                            <Field
                                as={TextField}
                                label="Valor"
                                name="value"
                                variant="outlined"
                                fullWidth
                                margin="dense"
                                type="text"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useCampaigns-selection">{i18n.t("plans.form.campaigns")}</InputLabel>
                                <Field
                                    as={Select}
                                    id="useCampaigns-selection"
                                    label={i18n.t("plans.form.campaigns")}
                                    labelId="useCampaigns-selection-label"
                                    name="useCampaigns"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={8} md={2}>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useSchedules-selection">{i18n.t("plans.form.schedules")}</InputLabel>
                                <Field
                                    as={Select}
                                    id="useSchedules-selection"
                                    label={i18n.t("plans.form.schedules")}
                                    labelId="useSchedules-selection-label"
                                    name="useSchedules"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={8} md={2}>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useInternalChat-selection">Chat Interno</InputLabel>
                                <Field
                                    as={Select}
                                    id="useInternalChat-selection"
                                    label="Chat Interno"
                                    labelId="useInternalChat-selection-label"
                                    name="useInternalChat"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={8} md={4}>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useExternalApi-selection">API Externa</InputLabel>
                                <Field
                                    as={Select}
                                    id="useExternalApi-selection"
                                    label="API Externa"
                                    labelId="useExternalApi-selection-label"
                                    name="useExternalApi"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={8} md={2}>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useKanban-selection">Kanban</InputLabel>
                                <Field
                                    as={Select}
                                    id="useKanban-selection"
                                    label="Kanban"
                                    labelId="useKanban-selection-label"
                                    name="useKanban"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={8} md={2}>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useOpenAi-selection">Open.Ai</InputLabel>
                                <Field
                                    as={Select}
                                    id="useOpenAi-selection"
                                    label="Open.Ai"
                                    labelId="useOpenAi-selection-label"
                                    name="useOpenAi"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={8} md={2}>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useIntegrations-selection">Integrações</InputLabel>
                                <Field
                                    as={Select}
                                    id="useIntegrations-selection"
                                    label="Integrações"
                                    labelId="useIntegrations-selection-label"
                                    name="useIntegrations"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <ActionButtons>
                                <ButtonWithSpinner
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    loading={loading}
                                >
                                    {i18n.t("plans.buttons.save")}
                                </ButtonWithSpinner>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={onCancel}
                                >
                                    {i18n.t("plans.buttons.cancel")}
                                </Button>
                                {initialValue && (
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={onDelete}
                                    >
                                        {i18n.t("plans.buttons.delete")}
                                    </Button>
                                )}
                            </ActionButtons>
                        </Grid>
                    </Grid>
                </Form>
            )}
        </Formik>
    );
}

export function PlansManagerGrid(props) {
    const { plans, onEdit, onDelete } = props;

    const renderCampaigns = (row) => (
        <StatusChip
            label={row.useCampaigns ? i18n.t("plans.form.enabled") : i18n.t("plans.form.disabled")}
            status={row.useCampaigns}
        />
    );

    const renderSchedules = (row) => (
        <StatusChip
            label={row.useSchedules ? i18n.t("plans.form.enabled") : i18n.t("plans.form.disabled")}
            status={row.useSchedules}
        />
    );

    const renderInternalChat = (row) => (
        <StatusChip
            label={row.useInternalChat ? i18n.t("plans.form.enabled") : i18n.t("plans.form.disabled")}
            status={row.useInternalChat}
        />
    );

    const renderExternalApi = (row) => (
        <StatusChip
            label={row.useExternalApi ? i18n.t("plans.form.enabled") : i18n.t("plans.form.disabled")}
            status={row.useExternalApi}
        />
    );

    const renderKanban = (row) => (
        <StatusChip
            label={row.useKanban ? i18n.t("plans.form.enabled") : i18n.t("plans.form.disabled")}
            status={row.useKanban}
        />
    );

    const renderOpenAi = (row) => (
        <StatusChip
            label={row.useOpenAi ? i18n.t("plans.form.enabled") : i18n.t("plans.form.disabled")}
            status={row.useOpenAi}
        />
    );

    const renderIntegrations = (row) => (
        <StatusChip
            label={row.useIntegrations ? i18n.t("plans.form.enabled") : i18n.t("plans.form.disabled")}
            status={row.useIntegrations}
        />
    );

    return (
        <MainPaper>
            <TableContainer>
                <StyledTable>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Nome</StyledTableCell>
                            <StyledTableCell>Usuários</StyledTableCell>
                            <StyledTableCell>Conexões</StyledTableCell>
                            <StyledTableCell>Filas</StyledTableCell>
                            <StyledTableCell>Valor</StyledTableCell>
                            <StyledTableCell>Campanhas</StyledTableCell>
                            <StyledTableCell>Agendamentos</StyledTableCell>
                            <StyledTableCell>Chat Interno</StyledTableCell>
                            <StyledTableCell>API Externa</StyledTableCell>
                            <StyledTableCell>Kanban</StyledTableCell>
                            <StyledTableCell>Open.Ai</StyledTableCell>
                            <StyledTableCell>Integrações</StyledTableCell>
                            <StyledTableCell>Ações</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {plans.map((row) => (
                            <TableRow
                                key={row.id}
                                sx={{
                                    '&:nth-of-type(odd)': {
                                        backgroundColor: 'action.hover',
                                    },
                                }}
                            >
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.users}</TableCell>
                                <TableCell>{row.connections}</TableCell>
                                <TableCell>{row.queues}</TableCell>
                                <TableCell>{row.value}</TableCell>
                                <TableCell>{renderCampaigns(row)}</TableCell>
                                <TableCell>{renderSchedules(row)}</TableCell>
                                <TableCell>{renderInternalChat(row)}</TableCell>
                                <TableCell>{renderExternalApi(row)}</TableCell>
                                <TableCell>{renderKanban(row)}</TableCell>
                                <TableCell>{renderOpenAi(row)}</TableCell>
                                <TableCell>{renderIntegrations(row)}</TableCell>
                                <TableCell>
                                    <ActionButtons>
                                        <IconButton
                                            size="small"
                                            onClick={() => onEdit(row)}
                                            color="primary"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => onDelete(row)}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </ActionButtons>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </StyledTable>
            </TableContainer>
        </MainPaper>
    );
}

const PlansManager = () => {
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [planToDelete, setPlanToDelete] = useState(null);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/plans");
            setPlans(data);
        } catch (err) {
            toastError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        setSelectedPlan(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setSelectedPlan(null);
        setShowModal(false);
    };

    const handleEdit = (plan) => {
        setSelectedPlan(plan);
        setShowModal(true);
    };

    const handleDelete = async (planId) => {
        try {
            await api.delete(`/plans/${planId}`);
            toast.success(i18n.t("plansManager.toasts.deleted"));
            fetchPlans();
        } catch (err) {
            toastError(err);
        }
    };

    const handleOpenDeleteModal = (plan) => {
        setPlanToDelete(plan);
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setPlanToDelete(null);
        setShowDeleteModal(false);
    };

    const handleConfirmDelete = () => {
        if (planToDelete) {
            handleDelete(planToDelete.id);
            handleCloseDeleteModal();
        }
    };

    return (
        <MainPaper>
            <Grid container spacing={3} alignItems="center" justifyContent="space-between">
                <Grid item>
                    <Typography variant="h4" component="h1">
                        {i18n.t("plansManager.title")}
                    </Typography>
                </Grid>
                <Grid item>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenModal}
                    >
                        {i18n.t("plansManager.buttons.new")}
                    </Button>
                </Grid>
            </Grid>

            <TableContainer component={Paper} sx={{ mt: 3 }}>
                <StyledTable>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>{i18n.t("plansManager.table.name")}</StyledTableCell>
                            <StyledTableCell align="center">{i18n.t("plansManager.table.users")}</StyledTableCell>
                            <StyledTableCell align="center">{i18n.t("plansManager.table.connections")}</StyledTableCell>
                            <StyledTableCell align="center">{i18n.t("plansManager.table.queues")}</StyledTableCell>
                            <StyledTableCell align="center">{i18n.t("plansManager.table.value")}</StyledTableCell>
                            <StyledTableCell align="center">{i18n.t("plansManager.table.status")}</StyledTableCell>
                            <StyledTableCell align="center">{i18n.t("plansManager.table.actions")}</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {plans.map((plan) => (
                            <TableRow key={plan.id}>
                                <TableCell>{plan.name}</TableCell>
                                <TableCell align="center">{plan.users}</TableCell>
                                <TableCell align="center">{plan.connections}</TableCell>
                                <TableCell align="center">{plan.queues}</TableCell>
                                <TableCell align="center">
                                    {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                    }).format(plan.value)}
                                </TableCell>
                                <TableCell align="center">
                                    <StatusChip
                                        label={plan.isActive ? i18n.t("plansManager.status.active") : i18n.t("plansManager.status.inactive")}
                                        status={plan.isActive}
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <ActionButtons>
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => handleEdit(plan)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleOpenDeleteModal(plan)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </ActionButtons>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </StyledTable>
            </TableContainer>

            <PlanModal
                open={showModal}
                onClose={handleCloseModal}
                plan={selectedPlan}
                onSave={fetchPlans}
            />

            <ConfirmationModal
                title={i18n.t("plansManager.deleteModal.title")}
                open={showDeleteModal}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
            >
                {i18n.t("plansManager.deleteModal.message")}
            </ConfirmationModal>
        </MainPaper>
    );
};

export default PlansManager;
