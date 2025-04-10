import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import { createWhatsApp } from '../../store/modules/whatsapp/actions';

const Form = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const WhatsAppModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await dispatch(createWhatsApp({ name }));
      toast.success('WhatsApp adicionado com sucesso!');
      onClose();
    } catch (err) {
      toast.error('Erro ao adicionar WhatsApp!');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Adicionar WhatsApp</DialogTitle>
      <DialogContent>
        <Form onSubmit={handleSubmit}>
          <TextField
            autoFocus
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
        </Form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || !name}
        >
          {loading ? <CircularProgress size={24} /> : 'Adicionar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WhatsAppModal; 
