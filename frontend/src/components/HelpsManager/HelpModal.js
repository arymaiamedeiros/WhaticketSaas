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
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    width: "100%",
    maxWidth: 500,
    [theme.breakpoints.down("sm")]: {
      margin: theme.spacing(1),
    },
  },
}));

const HelpModal = ({ open, onClose, help, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video: "",
    category: "",
    isActive: true,
  });

  useEffect(() => {
    if (help) {
      setFormData({
        title: help.title,
        description: help.description || "",
        video: help.video || "",
        category: help.category || "",
        isActive: help.isActive,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        video: "",
        category: "",
        isActive: true,
      });
    }
  }, [help]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "isActive" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (help) {
        await api.put(`/helps/${help.id}`, formData);
        toast.success(i18n.t("helpsManager.toasts.updated"));
      } else {
        await api.post("/helps", formData);
        toast.success(i18n.t("helpsManager.toasts.created"));
      }
      onSave();
      onClose();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose}>
      <DialogTitle>
        {help
          ? i18n.t("helpsManager.modal.editTitle")
          : i18n.t("helpsManager.modal.addTitle")}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={i18n.t("helpsManager.form.title")}
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={i18n.t("helpsManager.form.description")}
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={i18n.t("helpsManager.form.video")}
                name="video"
                value={formData.video}
                onChange={handleChange}
                placeholder="Código do vídeo do YouTube"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{i18n.t("helpsManager.form.category")}</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label={i18n.t("helpsManager.form.category")}
                >
                  <MenuItem value="general">{i18n.t("helpsManager.categories.general")}</MenuItem>
                  <MenuItem value="whatsapp">{i18n.t("helpsManager.categories.whatsapp")}</MenuItem>
                  <MenuItem value="facebook">{i18n.t("helpsManager.categories.facebook")}</MenuItem>
                  <MenuItem value="instagram">{i18n.t("helpsManager.categories.instagram")}</MenuItem>
                  <MenuItem value="campaigns">{i18n.t("helpsManager.categories.campaigns")}</MenuItem>
                  <MenuItem value="schedules">{i18n.t("helpsManager.categories.schedules")}</MenuItem>
                  <MenuItem value="integrations">{i18n.t("helpsManager.categories.integrations")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleChange}
                    name="isActive"
                  />
                }
                label={i18n.t("helpsManager.form.isActive")}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {i18n.t("helpsManager.buttons.cancel")}
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {i18n.t("helpsManager.buttons.save")}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default HelpModal; 
