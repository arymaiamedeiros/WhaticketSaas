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

const CompanyModal = ({ open, onClose, company, onSave, plans }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    planId: "",
    status: true,
    campaignsEnabled: true,
  });

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        email: company.email,
        phone: company.phone || "",
        planId: company.planId,
        status: company.status,
        campaignsEnabled: company.campaignsEnabled,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        planId: "",
        status: true,
        campaignsEnabled: true,
      });
    }
  }, [company]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "status" || name === "campaignsEnabled" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (company) {
        await api.put(`/companies/${company.id}`, formData);
        toast.success(i18n.t("companiesManager.toasts.updated"));
      } else {
        await api.post("/companies", formData);
        toast.success(i18n.t("companiesManager.toasts.created"));
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
        {company
          ? i18n.t("companiesManager.modal.editTitle")
          : i18n.t("companiesManager.modal.addTitle")}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={i18n.t("companiesManager.form.name")}
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={i18n.t("companiesManager.form.email")}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={i18n.t("companiesManager.form.phone")}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>
                  {i18n.t("companiesManager.form.plan")}
                </InputLabel>
                <Select
                  name="planId"
                  value={formData.planId}
                  onChange={handleChange}
                  required
                >
                  {plans.map((plan) => (
                    <MenuItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.status}
                    onChange={handleChange}
                    name="status"
                  />
                }
                label={i18n.t("companiesManager.form.status")}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.campaignsEnabled}
                    onChange={handleChange}
                    name="campaignsEnabled"
                  />
                }
                label={i18n.t("companiesManager.form.campaignsEnabled")}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {i18n.t("companiesManager.buttons.cancel")}
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {i18n.t("companiesManager.buttons.save")}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default CompanyModal; 
