import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import { Grid, LinearProgress, Typography } from "@mui/material";
import api from "../../services/api";
import { has, get, isNull } from "lodash";
import CardCounter from "../../components/Dashboard/CardCounter";
import GroupIcon from "@mui/icons-material/Group";
import ScheduleIcon from "@mui/icons-material/Schedule";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { useDate } from "../../hooks/useDate";

import { socketConnection } from "../../services/socket";

const MainPaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  overflowY: "scroll",
  ...theme.scrollbarStyles,
}));

const ProgressBar = styled(LinearProgress)({
  height: 15,
  borderRadius: 3,
  margin: "20px 0",
});

const CampaignReport = () => {
  const { campaignId } = useParams();

  const [campaign, setCampaign] = useState({});
  const [validContacts, setValidContacts] = useState(0);
  const [delivered, setDelivered] = useState(0);
  const [confirmationRequested, setConfirmationRequested] = useState(0);
  const [confirmed, setConfirmed] = useState(0);
  const [percent, setPercent] = useState(0);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);

  const { datetimeToClient } = useDate();

  useEffect(() => {
    if (mounted.current) {
      findCampaign();
    }

    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mounted.current && has(campaign, "shipping")) {
      if (has(campaign, "contactList")) {
        const contactList = get(campaign, "contactList");
        const valids = contactList.contacts.filter((c) => c.isWhatsappValid);
        setValidContacts(valids.length);
      }

      if (has(campaign, "shipping")) {
        const contacts = get(campaign, "shipping");
        const delivered = contacts.filter((c) => !isNull(c.deliveredAt));
        const confirmationRequested = contacts.filter(
          (c) => !isNull(c.confirmationRequestedAt)
        );
        const confirmed = contacts.filter(
          (c) => !isNull(c.deliveredAt) && !isNull(c.confirmationRequestedAt)
        );
        setDelivered(delivered.length);
        setConfirmationRequested(confirmationRequested.length);
        setConfirmed(confirmed.length);
        setDelivered(delivered.length);
      }
    }
  }, [campaign]);

  useEffect(() => {
    setPercent((delivered / validContacts) * 100);
  }, [delivered, validContacts]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketConnection({ companyId });

    socket.on(`company-${companyId}-campaign`, (data) => {
      if (data.record.id === +campaignId) {
        setCampaign(data.record);

        if (data.record.status === "FINALIZADA") {
          setTimeout(() => {
            findCampaign();
          }, 5000);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  const findCampaign = async () => {
    setLoading(true);
    const { data } = await api.get(`/campaigns/${campaignId}`);
    setCampaign(data);
    setLoading(false);
  };

  const formatStatus = (val) => {
    switch (val) {
      case "INATIVA":
        return "Inativa";
      case "PROGRAMADA":
        return "Programada";
      case "EM_ANDAMENTO":
        return "Em Andamento";
      case "CANCELADA":
        return "Cancelada";
      case "FINALIZADA":
        return "Finalizada";
      default:
        return val;
    }
  };

  return (
    <MainContainer>
      <MainHeader>
        <Grid container>
          <Grid xs={12} item>
            <Title>Relatório da {campaign.name || "Campanha"}</Title>
          </Grid>
        </Grid>
      </MainHeader>
      <MainPaper variant="outlined">
        <Typography variant="h6" component="h2">
          Status: {formatStatus(campaign.status)} {delivered} de {validContacts}
        </Typography>
        <Grid spacing={2} container>
          <Grid xs={12} item>
            <ProgressBar variant="determinate" value={percent} />
          </Grid>
          <Grid xs={12} md={4} item>
            <CardCounter
              icon={<GroupIcon fontSize="inherit" />}
              title="Contatos Válidos"
              value={validContacts}
              loading={loading}
            />
          </Grid>
          {campaign.confirmation && (
            <>
              <Grid xs={12} md={4} item>
                <CardCounter
                  icon={<DoneIcon fontSize="inherit" />}
                  title="Confirmações Solicitadas"
                  value={confirmationRequested}
                  loading={loading}
                />
              </Grid>
              <Grid xs={12} md={4} item>
                <CardCounter
                  icon={<DoneAllIcon fontSize="inherit" />}
                  title="Confirmações"
                  value={confirmed}
                  loading={loading}
                />
              </Grid>
            </>
          )}
          <Grid xs={12} md={4} item>
            <CardCounter
              icon={<CheckCircleIcon fontSize="inherit" />}
              title="Entregues"
              value={delivered}
              loading={loading}
            />
          </Grid>
          {campaign.whatsappId && (
            <Grid xs={12} md={4} item>
              <CardCounter
                icon={<WhatsAppIcon fontSize="inherit" />}
                title="Conexão"
                value={campaign.whatsapp.name}
                loading={loading}
              />
            </Grid>
          )}
          {campaign.contactListId && (
            <Grid xs={12} md={4} item>
              <CardCounter
                icon={<ListAltIcon fontSize="inherit" />}
                title="Lista de Contatos"
                value={campaign.contactList.name}
                loading={loading}
              />
            </Grid>
          )}
          <Grid xs={12} md={4} item>
            <CardCounter
              icon={<ScheduleIcon fontSize="inherit" />}
              title="Agendamento"
              value={datetimeToClient(campaign.scheduledAt)}
              loading={loading}
            />
          </Grid>
          <Grid xs={12} md={4} item>
            <CardCounter
              icon={<EventAvailableIcon fontSize="inherit" />}
              title="Conclusão"
              value={datetimeToClient(campaign.completedAt)}
              loading={loading}
            />
          </Grid>
        </Grid>
      </MainPaper>
    </MainContainer>
  );
};

export default CampaignReport;
