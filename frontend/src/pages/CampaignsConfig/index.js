import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import api from "../../services/api";

import { i18n } from "../../translate/i18n";
import {
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ConfirmationModal from "../../components/ConfirmationModal";

const MainPaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(1),
  overflowY: "scroll",
  ...theme.scrollbarStyles,
}));

const TabPanelsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const TextRight = styled(Box)({
  textAlign: "right",
});

const initialSettings = {
  messageInterval: 20,
  longerIntervalAfter: 20,
  greaterInterval: 60,
  variables: [],
};

const CampaignsConfig = () => {
  const [settings, setSettings] = useState(initialSettings);
  const [showVariablesForm, setShowVariablesForm] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [variable, setVariable] = useState({ key: "", value: "" });

  useEffect(() => {
    api.get("/campaign-settings").then(({ data }) => {
      const settingsList = [];
      if (Array.isArray(data) && data.length > 0) {
        data.forEach((item) => {
          settingsList.push([item.key, JSON.parse(item.value)]);
        });
        setSettings(Object.fromEntries(settingsList));
      }
    });
  }, []);

  const handleOnChangeVariable = (e) => {
    if (e.target.value !== null) {
      const changedProp = {};
      changedProp[e.target.name] = e.target.value;
      setVariable((prev) => ({ ...prev, ...changedProp }));
    }
  };

  const handleOnChangeSettings = (e) => {
    const changedProp = {};
    changedProp[e.target.name] = e.target.value;
    setSettings((prev) => ({ ...prev, ...changedProp }));
  };

  const addVariable = () => {
    setSettings((prev) => {
      const variablesExists = settings.variables.filter(
        (v) => v.key === variable.key
      );
      const variables = prev.variables;
      if (variablesExists.length === 0) {
        variables.push(Object.assign({}, variable));
        setVariable({ key: "", value: "" });
      }
      return { ...prev, variables };
    });
  };

  const removeVariable = () => {
    const newList = settings.variables.filter((v) => v.key !== selectedKey);
    setSettings((prev) => ({ ...prev, variables: newList }));
    setSelectedKey(null);
  };

  const saveSettings = async () => {
    await api.post("/campaign-settings", { settings });
    toast.success("Configurações salvas");
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={i18n.t("campaigns.confirmationModal.deleteTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={removeVariable}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <MainHeader>
        <Grid container>
          <Grid xs={12} item>
            <Title>{i18n.t("campaignsConfig.title")}</Title>
          </Grid>
        </Grid>
      </MainHeader>
      <MainPaper variant="outlined">
        <TabPanelsContainer>
          <Grid spacing={2} container>
            <Grid xs={12} item>
              <Typography component={"h3"}>Intervalos</Typography>
            </Grid>
            <Grid xs={12} md={4} item>
              <FormControl variant="outlined" fullWidth>
                <InputLabel id="messageInterval-label">
                  Intervalo Randômico de Disparo
                </InputLabel>
                <Select
                  name="messageInterval"
                  id="messageInterval"
                  labelId="messageInterval-label"
                  label="Intervalo Randômico de Disparo"
                  value={settings.messageInterval}
                  onChange={(e) => handleOnChangeSettings(e)}
                >
                  <MenuItem value={0}>Sem Intervalo</MenuItem>
                  <MenuItem value={5}>5 segundos</MenuItem>
                  <MenuItem value={10}>10 segundos</MenuItem>
                  <MenuItem value={15}>15 segundos</MenuItem>
                  <MenuItem value={20}>20 segundos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} md={4} item>
              <FormControl variant="outlined" fullWidth>
                <InputLabel id="longerIntervalAfter-label">
                  Intervalo Maior Após
                </InputLabel>
                <Select
                  name="longerIntervalAfter"
                  id="longerIntervalAfter"
                  labelId="longerIntervalAfter-label"
                  label="Intervalo Maior Após"
                  value={settings.longerIntervalAfter}
                  onChange={(e) => handleOnChangeSettings(e)}
                >
                  <MenuItem value={0}>Não definido</MenuItem>
                  <MenuItem value={1}>1 segundo</MenuItem>
                  <MenuItem value={5}>5 segundos</MenuItem>
                  <MenuItem value={10}>10 segundos</MenuItem>
                  <MenuItem value={15}>15 segundos</MenuItem>
                  <MenuItem value={20}>20 segundos</MenuItem>
                  <MenuItem value={30}>30 segundos</MenuItem>
                  <MenuItem value={40}>40 segundos</MenuItem>
                  <MenuItem value={60}>60 segundos</MenuItem>
                  <MenuItem value={80}>80 segundos</MenuItem>
                  <MenuItem value={100}>100 segundos</MenuItem>
                  <MenuItem value={120}>120 segundos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} md={4} item>
              <FormControl variant="outlined" fullWidth>
                <InputLabel id="greaterInterval-label">
                  Intervalo de Disparo Maior
                </InputLabel>
                <Select
                  name="greaterInterval"
                  id="greaterInterval"
                  labelId="greaterInterval-label"
                  label="Intervalo de Disparo Maior"
                  value={settings.greaterInterval}
                  onChange={(e) => handleOnChangeSettings(e)}
                >
                  <MenuItem value={0}>Sem Intervalo</MenuItem>
                  <MenuItem value={1}>1 segundo</MenuItem>
                  <MenuItem value={5}>5 segundos</MenuItem>
                  <MenuItem value={10}>10 segundos</MenuItem>
                  <MenuItem value={15}>15 segundos</MenuItem>
                  <MenuItem value={20}>20 segundos</MenuItem>
                  <MenuItem value={30}>30 segundos</MenuItem>
                  <MenuItem value={40}>40 segundos</MenuItem>
                  <MenuItem value={60}>60 segundos</MenuItem>
                  <MenuItem value={80}>80 segundos</MenuItem>
                  <MenuItem value={100}>100 segundos</MenuItem>
                  <MenuItem value={120}>120 segundos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <TextRight xs={12} item>
              <Button
                onClick={() => setShowVariablesForm(!showVariablesForm)}
                color="primary"
                style={{ marginRight: 10 }}
              >
                Adicionar Variável
              </Button>
              <Button
                onClick={saveSettings}
                color="primary"
                variant="contained"
              >
                Salvar Configurações
              </Button>
            </TextRight>
            {showVariablesForm && (
              <>
                <Grid xs={12} md={6} item>
                  <TextField
                    label="Atalho"
                    variant="outlined"
                    value={variable.key}
                    name="key"
                    onChange={handleOnChangeVariable}
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} md={6} item>
                  <TextField
                    label="Valor"
                    variant="outlined"
                    value={variable.value}
                    name="value"
                    onChange={handleOnChangeVariable}
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} item>
                  <Button
                    onClick={addVariable}
                    color="primary"
                    variant="contained"
                  >
                    Adicionar
                  </Button>
                </Grid>
              </>
            )}
            {settings.variables.length > 0 && (
              <Grid xs={12} item>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Atalho</TableCell>
                      <TableCell>Valor</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {settings.variables.map((variable) => (
                      <TableRow key={variable.key}>
                        <TableCell>{variable.key}</TableCell>
                        <TableCell>{variable.value}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedKey(variable.key);
                              setConfirmationOpen(true);
                            }}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Grid>
            )}
          </Grid>
        </TabPanelsContainer>
      </MainPaper>
    </MainContainer>
  );
};

export default CampaignsConfig;
