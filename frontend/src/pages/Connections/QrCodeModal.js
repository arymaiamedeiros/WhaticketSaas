import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import QRCode from 'qrcode.react';
import { useDispatch } from 'react-redux';
import { getQrCode } from '../../store/modules/whatsapp/actions';

const QrCodeContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
}));

const QrCodeModal = ({ open, onClose, whatsApp }) => {
  const dispatch = useDispatch();
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQrCode = async () => {
      if (!whatsApp) return;

      setLoading(true);
      setError('');

      try {
        const response = await dispatch(getQrCode(whatsApp.id));
        setQrCode(response.qrcode);
      } catch (err) {
        setError('Erro ao carregar QR Code');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchQrCode();
    }
  }, [dispatch, whatsApp, open]);

  if (!whatsApp) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>QR Code - {whatsApp.name}</DialogTitle>
      <DialogContent>
        <QrCodeContainer>
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : qrCode ? (
            <QRCode value={qrCode} size={256} level="H" />
          ) : (
            <Typography>Nenhum QR Code disponível</Typography>
          )}
        </QrCodeContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default QrCodeModal; 
