import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

const DeleteModal = ({ open, onClose, onConfirm, whatsApp }) => {
  if (!whatsApp) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Excluir WhatsApp</DialogTitle>
      <DialogContent>
        <Typography>
          Tem certeza que deseja excluir o WhatsApp "{whatsApp.name}"?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteModal; 
