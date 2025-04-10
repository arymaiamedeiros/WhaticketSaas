import React, { useState, useEffect } from "react";
import { styled } from '@mui/material/styles';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography
} from "@mui/material";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const Root = styled(Box)({
  padding: 16,
});

const QueueOptions = ({ queueId }) => {
  const [options, setOptions] = useState({
    maxAttempts: 3,
    retryInterval: 30,
    maxWaitTime: 60,
    autoAssign: false,
    autoAssignType: "roundRobin"
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (queueId) {
      loadOptions();
    }
  }, [queueId]);

  const loadOptions = async () => {
    try {
      const { data } = await api.get(`/queue/${queueId}/options`);
      setOptions(data);
    } catch (err) {
      toastError(err);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.put(`/queue/${queueId}/options`, options);
      toast.success("Opções salvas com sucesso");
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setOptions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Root>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label={i18n.t("queueOptions.maxAttempts")}
            type="number"
            value={options.maxAttempts}
            onChange={(e) => handleChange("maxAttempts", parseInt(e.target.value))}
            fullWidth
            margin="dense"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label={i18n.t("queueOptions.retryInterval")}
            type="number"
            value={options.retryInterval}
            onChange={(e) => handleChange("retryInterval", parseInt(e.target.value))}
            fullWidth
            margin="dense"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label={i18n.t("queueOptions.maxWaitTime")}
            type="number"
            value={options.maxWaitTime}
            onChange={(e) => handleChange("maxWaitTime", parseInt(e.target.value))}
            fullWidth
            margin="dense"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={options.autoAssign}
                onChange={(e) => handleChange("autoAssign", e.target.checked)}
              />
            }
            label={i18n.t("queueOptions.autoAssign")}
          />
        </Grid>
        {options.autoAssign && (
          <Grid item xs={12}>
            <FormControl fullWidth margin="dense">
              <InputLabel>{i18n.t("queueOptions.autoAssignType")}</InputLabel>
              <Select
                value={options.autoAssignType}
                onChange={(e) => handleChange("autoAssignType", e.target.value)}
                label={i18n.t("queueOptions.autoAssignType")}
              >
                <MenuItem value="roundRobin">
                  {i18n.t("queueOptions.autoAssignTypes.roundRobin")}
                </MenuItem>
                <MenuItem value="leastBusy">
                  {i18n.t("queueOptions.autoAssignTypes.leastBusy")}
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={loading}
          >
            {i18n.t("queueOptions.buttons.save")}
          </Button>
        </Grid>
      </Grid>
    </Root>
  );
};

export default QueueOptions;
