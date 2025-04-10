import React, { useState, useEffect } from "react";
import { styled } from '@mui/material/styles';
import {
    Paper,
    Grid,
    Typography,
    Button,
    Box,
    CircularProgress,
    Alert,
    Snackbar
} from "@mui/material";
import { i18n } from "../../../translate/i18n";
import PlansManagerGrid from "./PlansManagerGrid";
import PlansManagerModal from "./PlansManagerModal";
import api from "../../services/api";

const Root = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
}));

const Header = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    minHeight: 400,
}));

const PlansManager = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/plans");
            setPlans(data);
            setError(null);
        } catch (err) {
            setError(i18n.t("plansManager.errors.fetch"));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (plan = null) => {
        setSelectedPlan(plan);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedPlan(null);
        setModalOpen(false);
    };

    const handleSubmit = async (formData) => {
        try {
            if (selectedPlan) {
                await api.put(`/plans/${selectedPlan.id}`, formData);
                setSnackbar({
                    open: true,
                    message: i18n.t("plansManager.success.update"),
                    severity: "success",
                });
            } else {
                await api.post("/plans", formData);
                setSnackbar({
                    open: true,
                    message: i18n.t("plansManager.success.create"),
                    severity: "success",
                });
            }
            fetchPlans();
            handleCloseModal();
        } catch (err) {
            setSnackbar({
                open: true,
                message: i18n.t("plansManager.errors.submit"),
                severity: "error",
            });
            console.error(err);
        }
    };

    const handleDelete = async (planId) => {
        try {
            await api.delete(`/plans/${planId}`);
            setSnackbar({
                open: true,
                message: i18n.t("plansManager.success.delete"),
                severity: "success",
            });
            fetchPlans();
        } catch (err) {
            setSnackbar({
                open: true,
                message: i18n.t("plansManager.errors.delete"),
                severity: "error",
            });
            console.error(err);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Root>
            <Header>
                <Typography variant="h4" component="h1">
                    {i18n.t("plansManager.title")}
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenModal()}
                >
                    {i18n.t("plansManager.buttons.new")}
                </Button>
            </Header>

            <StyledPaper>
                {loading ? (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        minHeight={400}
                    >
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : (
                    <PlansManagerGrid
                        plans={plans}
                        onEdit={handleOpenModal}
                        onDelete={handleDelete}
                    />
                )}
            </StyledPaper>

            <PlansManagerModal
                open={modalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                plan={selectedPlan}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Root>
    );
};

export default PlansManager; 
