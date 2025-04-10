import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip
} from "@mui/material";
import { toast } from "react-toastify";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import Title from "../Title";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import { toastError } from "../../utils/toast";
import { useAuth } from "../../context/Auth/AuthContext";

const Root = styled("div")(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const FixedHeightPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  overflow: "auto",
  flexDirection: "column",
  height: 240,
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  marginBottom: 12,
  width: "100%",
}));

const CardAvatar = styled(Box)(({ theme }) => ({
  fontSize: "55px",
  color: theme.palette.grey[500],
  backgroundColor: "#ffffff",
  width: theme.spacing(7),
  height: theme.spacing(7),
}));

const CardTitle = styled(Typography)({
  fontSize: "18px",
  color: theme.palette.primary.main,
});

const CardSubtitle = styled(Typography)({
  color: theme.palette.grey[600],
  fontSize: "14px",
});

const AlignRight = styled(Box)({
  textAlign: "right",
});

const FullWidth = styled(Box)({
  width: "100%",
});

const SelectContainer = styled(Box)({
  width: "100%",
  textAlign: "left",
});

const StyledFormControl = styled(FormControl)({
  width: "100%",
  textAlign: "left",
});

const Settings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentSetting, setCurrentSetting] = useState(null);
  const [value, setValue] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/settings");
      setSettings(data);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (setting) => {
    setCurrentSetting(setting);
    setValue(setting.value);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentSetting(null);
    setValue("");
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.put(`/settings/${currentSetting.id}`, {
        value,
      });
      toast.success("Configuração atualizada com sucesso!");
      loadSettings();
      handleClose();
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (setting) => {
    try {
      setLoading(true);
      await api.delete(`/settings/${setting.id}`);
      toast.success("Configuração excluída com sucesso!");
      loadSettings();
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Root>
      <Title>Configurações</Title>
      <Grid container spacing={3}>
        {settings.map((setting) => (
          <Grid item xs={12} sm={6} md={4} key={setting.id}>
            <StyledPaper>
              <CardAvatar>
                <i className="fas fa-cog"></i>
              </CardAvatar>
              <Box sx={{ flex: 1, ml: 2 }}>
                <CardTitle>{setting.key}</CardTitle>
                <CardSubtitle>{setting.value}</CardSubtitle>
              </Box>
              <AlignRight>
                <Tooltip title="Editar">
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(setting)}
                    disabled={loading}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excluir">
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(setting)}
                    disabled={loading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </AlignRight>
            </StyledPaper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Configuração</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Chave"
              value={currentSetting?.key}
              disabled
              fullWidth
              margin="dense"
            />
            <TextField
              label="Valor"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              fullWidth
              margin="dense"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSave} color="primary" disabled={loading}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Root>
  );
};

export default Settings; 
