import React from "react";
import { styled } from '@mui/material/styles';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
    Typography,
    Box
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { i18n } from "../../../translate/i18n";

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    marginTop: theme.spacing(2),
}));

const StyledTable = styled(Table)({
    minWidth: 650,
});

const StyledTableHead = styled(TableHead)(({ theme }) => ({
    backgroundColor: theme.palette.grey[100],
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    padding: theme.spacing(2),
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:hover': {
        backgroundColor: theme.palette.action.selected,
    },
}));

const PlansManagerGrid = ({ plans, onEdit, onDelete }) => {
    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                {i18n.t("plansManager.grid.title")}
            </Typography>
            <StyledTableContainer component={Paper}>
                <StyledTable>
                    <StyledTableHead>
                        <TableRow>
                            <StyledTableCell>{i18n.t("plansManager.grid.name")}</StyledTableCell>
                            <StyledTableCell align="right">{i18n.t("plansManager.grid.users")}</StyledTableCell>
                            <StyledTableCell align="right">{i18n.t("plansManager.grid.connections")}</StyledTableCell>
                            <StyledTableCell align="right">{i18n.t("plansManager.grid.queues")}</StyledTableCell>
                            <StyledTableCell align="right">{i18n.t("plansManager.grid.value")}</StyledTableCell>
                            <StyledTableCell align="center">{i18n.t("plansManager.grid.actions")}</StyledTableCell>
                        </TableRow>
                    </StyledTableHead>
                    <TableBody>
                        {plans.map((plan) => (
                            <StyledTableRow key={plan.id}>
                                <StyledTableCell component="th" scope="row">
                                    {plan.name}
                                </StyledTableCell>
                                <StyledTableCell align="right">{plan.users}</StyledTableCell>
                                <StyledTableCell align="right">{plan.connections}</StyledTableCell>
                                <StyledTableCell align="right">{plan.queues}</StyledTableCell>
                                <StyledTableCell align="right">
                                    {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                    }).format(plan.value)}
                                </StyledTableCell>
                                <StyledTableCell align="center">
                                    <Tooltip title={i18n.t("plansManager.grid.edit")}>
                                        <IconButton
                                            color="primary"
                                            onClick={() => onEdit(plan)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={i18n.t("plansManager.grid.delete")}>
                                        <IconButton
                                            color="error"
                                            onClick={() => onDelete(plan.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </StyledTableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </StyledTable>
            </StyledTableContainer>
        </Box>
    );
};

export default PlansManagerGrid; 
