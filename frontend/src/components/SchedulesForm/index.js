import React, { useState } from "react";
import { styled } from '@mui/material/styles';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon
} from "@mui/icons-material";
import { i18n } from "../../translate/i18n";

const Root = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

const StyledTable = styled(Table)(({ theme }) => ({
  minWidth: 650,
  '& .MuiTableCell-root': {
    padding: theme.spacing(1.5),
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: "bold",
  backgroundColor: theme.palette.grey[100],
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
}));

const ScheduleForm = ({ schedules, handleSaveSchedules }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedSchedule, setEditedSchedule] = useState(null);

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditedSchedule(schedules[index]);
  };

  const handleSave = () => {
    const newSchedules = [...schedules];
    newSchedules[editingIndex] = editedSchedule;
    handleSaveSchedules(newSchedules);
    setEditingIndex(null);
    setEditedSchedule(null);
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditedSchedule(null);
  };

  const handleChange = (field, value) => {
    setEditedSchedule(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Root>
      <TableContainer component={Paper} elevation={2}>
        <StyledTable>
          <TableHead>
            <TableRow>
              <StyledTableCell>Dia</StyledTableCell>
              <StyledTableCell>Horário de Início</StyledTableCell>
              <StyledTableCell>Horário de Término</StyledTableCell>
              <StyledTableCell>Ações</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedules.map((schedule, index) => (
              <TableRow 
                key={index}
                sx={{
                  '&:nth-of-type(odd)': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <TableCell>{schedule.weekday}</TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <TextField
                      type="time"
                      value={editedSchedule.startTime}
                      onChange={(e) => handleChange("startTime", e.target.value)}
                      size="small"
                      fullWidth
                    />
                  ) : (
                    schedule.startTime
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <TextField
                      type="time"
                      value={editedSchedule.endTime}
                      onChange={(e) => handleChange("endTime", e.target.value)}
                      size="small"
                      fullWidth
                    />
                  ) : (
                    schedule.endTime
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <ActionButtons>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                      >
                        Salvar
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        onClick={handleCancel}
                      >
                        Cancelar
                      </Button>
                    </ActionButtons>
                  ) : (
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(index)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </StyledTable>
      </TableContainer>
    </Root>
  );
};

export default ScheduleForm;
