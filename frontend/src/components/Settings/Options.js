import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import {
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  TextField,
  Paper,
  Typography,
  Tabs,
  Tab,
  Box
} from "@mui/material";
import { grey, blue } from "@mui/material/colors";
import Title from "../Title";
import useSettings from "../../hooks/useSettings";
import { ToastContainer, toast } from 'react-toastify';

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

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: theme.palette.options,
  borderRadius: 4,
  width: "100%",
  "& .MuiTab-wrapper": {
    color: theme.palette.fontecor,
  },
  "& .MuiTabs-flexContainer": {
    justifyContent: "center"
  }
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
  color: grey[500],
  backgroundColor: "#ffffff",
  width: theme.spacing(7),
  height: theme.spacing(7),
}));

const CardTitle = styled(Typography)({
  fontSize: "18px",
  color: blue[700],
});

const CardSubtitle = styled(Typography)({
  color: grey[600],
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

export default function Options(props) {
  const { settings, scheduleTypeChanged } = props;
  const [userRating, setUserRating] = useState("disabled");
  const [scheduleType, setScheduleType] = useState("disabled");
  const [callType, setCallType] = useState("enabled");
  const [chatbotType, setChatbotType] = useState("");
  const [CheckMsgIsGroup, setCheckMsgIsGroupType] = useState("enabled");

  const [loadingUserRating, setLoadingUserRating] = useState(false);
  const [loadingScheduleType, setLoadingScheduleType] = useState(false);
  const [loadingCallType, setLoadingCallType] = useState(false);
  const [loadingChatbotType, setLoadingChatbotType] = useState(false);
  const [loadingCheckMsgIsGroup, setCheckMsgIsGroup] = useState(false);

  const [ipixcType, setIpIxcType] = useState("");
  const [loadingIpIxcType, setLoadingIpIxcType] = useState(false);
  const [tokenixcType, setTokenIxcType] = useState("");
  const [loadingTokenIxcType, setLoadingTokenIxcType] = useState(false);

  const [ipmkauthType, setIpMkauthType] = useState("");
  const [loadingIpMkauthType, setLoadingIpMkauthType] = useState(false);
  const [clientidmkauthType, setClientIdMkauthType] = useState("");
  const [loadingClientIdMkauthType, setLoadingClientIdMkauthType] = useState(false);
  const [clientsecretmkauthType, setClientSecrectMkauthType] = useState("");
  const [loadingClientSecrectMkauthType, setLoadingClientSecrectMkauthType] = useState(false);

  const [asaasType, setAsaasType] = useState("");
  const [loadingAsaasType, setLoadingAsaasType] = useState(false);

  const [SendGreetingAccepted, setSendGreetingAccepted] = useState("disabled");
  const [loadingSendGreetingAccepted, setLoadingSendGreetingAccepted] = useState(false);
  
  const [SettingsTransfTicket, setSettingsTransfTicket] = useState("disabled");
  const [loadingSettingsTransfTicket, setLoadingSettingsTransfTicket] = useState(false);

  const { update } = useSettings();

  useEffect(() => {
    if (Array.isArray(settings) && settings.length) {
      const userRating = settings.find((s) => s.key === "userRating");
      if (userRating) {
        setUserRating(userRating.value);
      }
      const scheduleType = settings.find((s) => s.key === "scheduleType");
      if (scheduleType) {
        setScheduleType(scheduleType.value);
      }
      const callType = settings.find((s) => s.key === "call");
      if (callType) {
        setCallType(callType.value);
      }
      const CheckMsgIsGroup = settings.find((s) => s.key === "CheckMsgIsGroup");
      if (CheckMsgIsGroup) {
        setCheckMsgIsGroupType(CheckMsgIsGroup.value);
      }
      
      const SendGreetingAccepted = settings.find((s) => s.key === "sendGreetingAccepted");
      if (SendGreetingAccepted) {
        setSendGreetingAccepted(SendGreetingAccepted.value);
      }     
      
      const SettingsTransfTicket = settings.find((s) => s.key === "sendMsgTransfTicket");
      if (SettingsTransfTicket) {
        setSettingsTransfTicket(SettingsTransfTicket.value);
      }
      
      const chatbotType = settings.find((s) => s.key === "chatBotType");
      if (chatbotType) {
        setChatbotType(chatbotType.value);
      }

      const ipixcType = settings.find((s) => s.key === "ipixc");
      if (ipixcType) {
        setIpIxcType(ipixcType.value);
      }

      const tokenixcType = settings.find((s) => s.key === "tokenixc");
      if (tokenixcType) {
        setTokenIxcType(tokenixcType.value);
      }

      const ipmkauthType = settings.find((s) => s.key === "ipmkauth");
      if (ipmkauthType) {
        setIpMkauthType(ipmkauthType.value);
      }

      const clientidmkauthType = settings.find((s) => s.key === "clientidmkauth");
      if (clientidmkauthType) {
        setClientIdMkauthType(clientidmkauthType.value);
      }

      const clientsecretmkauthType = settings.find((s) => s.key === "clientsecretmkauth");
      if (clientsecretmkauthType) {
        setClientSecrectMkauthType(clientsecretmkauthType.value);
      }

      const asaasType = settings.find((s) => s.key === "asaas");
      if (asaasType) {
        setAsaasType(asaasType.value);
      }
    }
  }, [settings]);

  async function handleChangeUserRating(value) {
    setUserRating(value);
    setLoadingUserRating(true);
    await update({
      key: "userRating",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingUserRating(false);
  }

  async function handleScheduleType(value) {
    setScheduleType(value);
    setLoadingScheduleType(true);
    await update({
      key: "scheduleType",
      value,
    });
    toast.success('Operação atualizada com sucesso.', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      theme: "light",
      });
    setLoadingScheduleType(false);
    if (typeof scheduleTypeChanged === "function") {
      scheduleTypeChanged(value);
    }
  }

  async function handleCallType(value) {
    setCallType(value);
    setLoadingCallType(true);
    await update({
      key: "call",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingCallType(false);
  }

  async function handleChatbotType(value) {
    setChatbotType(value);
    setLoadingChatbotType(true);
    await update({
      key: "chatBotType",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingChatbotType(false);
  }

  async function handleGroupType(value) {
    setCheckMsgIsGroupType(value);
    setLoadingCheckMsgIsGroup(true);
    await update({
      key: "CheckMsgIsGroup",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingCheckMsgIsGroup(false);
  }

  async function handleSendGreetingAccepted(value) {
    setSendGreetingAccepted(value);
    setLoadingSendGreetingAccepted(true);
    await update({
      key: "sendGreetingAccepted",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingSendGreetingAccepted(false);
  }

  async function handleSettingsTransfTicket(value) {
    setSettingsTransfTicket(value);
    setLoadingSettingsTransfTicket(true);
    await update({
      key: "sendMsgTransfTicket",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingSettingsTransfTicket(false);
  }

  async function handleChangeIPIxc(value) {
    setIpIxcType(value);
    setLoadingIpIxcType(true);
    await update({
      key: "ipixc",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingIpIxcType(false);
  }

  async function handleChangeTokenIxc(value) {
    setTokenIxcType(value);
    setLoadingTokenIxcType(true);
    await update({
      key: "tokenixc",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingTokenIxcType(false);
  }

  async function handleChangeIpMkauth(value) {
    setIpMkauthType(value);
    setLoadingIpMkauthType(true);
    await update({
      key: "ipmkauth",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingIpMkauthType(false);
  }

  async function handleChangeClientIdMkauth(value) {
    setClientIdMkauthType(value);
    setLoadingClientIdMkauthType(true);
    await update({
      key: "clientidmkauth",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingClientIdMkauthType(false);
  }

  async function handleChangeClientSecrectMkauth(value) {
    setClientSecrectMkauthType(value);
    setLoadingClientSecrectMkauthType(true);
    await update({
      key: "clientsecretmkauth",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingClientSecrectMkauthType(false);
  }

  async function handleChangeAsaas(value) {
    setAsaasType(value);
    setLoadingAsaasType(true);
    await update({
      key: "asaas",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingAsaasType(false);
  }

  return (
    <Root>
      <Title>Configurações</Title>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledPaper>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <StyledFormControl variant="outlined">
                  <InputLabel>Avaliação de Usuários</InputLabel>
                  <Select
                    value={userRating}
                    onChange={(e) => handleChangeUserRating(e.target.value)}
                    label="Avaliação de Usuários"
                    disabled={loadingUserRating}
                  >
                    <MenuItem value="enabled">Habilitado</MenuItem>
                    <MenuItem value="disabled">Desabilitado</MenuItem>
                  </Select>
                </StyledFormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledFormControl variant="outlined">
                  <InputLabel>Agendamentos</InputLabel>
                  <Select
                    value={scheduleType}
                    onChange={(e) => handleScheduleType(e.target.value)}
                    label="Agendamentos"
                    disabled={loadingScheduleType}
                  >
                    <MenuItem value="enabled">Habilitado</MenuItem>
                    <MenuItem value="disabled">Desabilitado</MenuItem>
                  </Select>
                </StyledFormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledFormControl variant="outlined">
                  <InputLabel>Chamadas</InputLabel>
                  <Select
                    value={callType}
                    onChange={(e) => handleCallType(e.target.value)}
                    label="Chamadas"
                    disabled={loadingCallType}
                  >
                    <MenuItem value="enabled">Habilitado</MenuItem>
                    <MenuItem value="disabled">Desabilitado</MenuItem>
                  </Select>
                </StyledFormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledFormControl variant="outlined">
                  <InputLabel>Chatbot</InputLabel>
                  <Select
                    value={chatbotType}
                    onChange={(e) => handleChatbotType(e.target.value)}
                    label="Chatbot"
                    disabled={loadingChatbotType}
                  >
                    <MenuItem value="enabled">Habilitado</MenuItem>
                    <MenuItem value="disabled">Desabilitado</MenuItem>
                  </Select>
                </StyledFormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledFormControl variant="outlined">
                  <InputLabel>Verificar Mensagem em Grupo</InputLabel>
                  <Select
                    value={CheckMsgIsGroup}
                    onChange={(e) => handleGroupType(e.target.value)}
                    label="Verificar Mensagem em Grupo"
                    disabled={loadingCheckMsgIsGroup}
                  >
                    <MenuItem value="enabled">Habilitado</MenuItem>
                    <MenuItem value="disabled">Desabilitado</MenuItem>
                  </Select>
                </StyledFormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledFormControl variant="outlined">
                  <InputLabel>Enviar Saudação ao Aceitar</InputLabel>
                  <Select
                    value={SendGreetingAccepted}
                    onChange={(e) => handleSendGreetingAccepted(e.target.value)}
                    label="Enviar Saudação ao Aceitar"
                    disabled={loadingSendGreetingAccepted}
                  >
                    <MenuItem value="enabled">Habilitado</MenuItem>
                    <MenuItem value="disabled">Desabilitado</MenuItem>
                  </Select>
                </StyledFormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledFormControl variant="outlined">
                  <InputLabel>Enviar Mensagem ao Transferir</InputLabel>
                  <Select
                    value={SettingsTransfTicket}
                    onChange={(e) => handleSettingsTransfTicket(e.target.value)}
                    label="Enviar Mensagem ao Transferir"
                    disabled={loadingSettingsTransfTicket}
                  >
                    <MenuItem value="enabled">Habilitado</MenuItem>
                    <MenuItem value="disabled">Desabilitado</MenuItem>
                  </Select>
                </StyledFormControl>
              </Grid>
            </Grid>
          </StyledPaper>
        </Grid>
      </Grid>
      <ToastContainer />
    </Root>
  );
}
