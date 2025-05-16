import React, { useContext, useState, useEffect, useRef } from "react";

import { useReactToPrint } from "react-to-print";

import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import Typography from "@material-ui/core/Typography";
import { Button } from "@material-ui/core";

import SpeedIcon from "@material-ui/icons/Speed";
import GroupIcon from "@material-ui/icons/Group";
import AssignmentIcon from "@material-ui/icons/Assignment";
import PersonIcon from "@material-ui/icons/Person";
import CallIcon from "@material-ui/icons/Call";
import MobileFriendlyIcon from '@material-ui/icons/MobileFriendly';
import StoreIcon from '@material-ui/icons/Store';
import RecordVoiceOverIcon from "@material-ui/icons/RecordVoiceOver";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ForumIcon from "@material-ui/icons/Forum";
import FilterListIcon from "@material-ui/icons/FilterList";
import ClearIcon from "@material-ui/icons/Clear";
import SendIcon from "@material-ui/icons/Send";
import MessageIcon from "@material-ui/icons/Message";
import AccessAlarmIcon from "@material-ui/icons/AccessAlarm";
import TimerIcon from "@material-ui/icons/Timer";

import { makeStyles } from "@material-ui/core/styles";
import { grey, blue } from "@material-ui/core/colors";
import { toast } from "react-toastify";

import Chart from "./Chart";
import ButtonWithSpinner from "../../components/ButtonWithSpinner";

import CardCounter from "../../components/Dashboard/CardCounter";
import TableAttendantsStatus from "../../components/Dashboard/TableAttendantsStatus";
import { isArray } from "lodash";

import { AuthContext } from "../../context/Auth/AuthContext";

import useDashboard from "../../hooks/useDashboard";
import useTickets from "../../hooks/useTickets";
import useUsers from "../../hooks/useUsers";
import useContacts from "../../hooks/useContacts";
import useMessages from "../../hooks/useMessages";
import { ChatsUser } from "./ChartsUser";

import Filters from "./Filters";
import { isEmpty } from "lodash";
import moment from "moment";
import { ChartsDate } from "./ChartsDate";
import ChartsAppointmentsAtendent from "./ChartsAppointmentsAtendent";
import ChartsRushHour from "./ChartsRushHour";
import ChartsDepartamentRatings from "./ChartsDepartamentRatings";
import { validateAndFormatDate } from "../../utils/dateValidation";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.padding,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(2),
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    height: 240,
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  cardAvatar: {
    fontSize: "55px",
    color: grey[500],
    backgroundColor: "#ffffff",
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  card: {
    padding: theme.spacing(1),
    display: "flex",
    overflow: "hidden",
    flexDirection: "column",
    height: 120, // Altura menor
    backgroundColor:
      theme.palette.type === "dark"
        ? theme.palette.boxticket.main
        : theme.palette.primary.main,
    color: "#fff",
  },
  cardIcon: {
    fontSize: 50, // Ícone menor
    color: "#fff",
  },
  cardTitle: {
    fontSize: "15px", // Tamanho menor para o título
    fontWeight: 700,
  },
  cardSubtitle: {
    fontSize: "25px", // Subtítulo ajustado
    fontWeight: 600,
    color: theme.palette.contadordash.main,
  },
  alignRight: {
    textAlign: "right",
  },
  fullWidth: {
    width: "100%",
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
  iframeDashboard: {
    width: "100%",
    height: "calc(100vh - 64px)",
    border: "none",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 240,
  },
  customFixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 120,
  },
  customFixedHeightPaperLg: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
  },
  fixedHeightPaper2: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  const pageToPrint = useRef(null);

  const [counters, setCounters] = useState({
    supportHappening: 0,
    supportPending: 0,
    supportFinished: 0,
    avgSupportTime: 0,
    countSupportByUser: [],
    totalWhatsappSessions: 0,
    totalCompanies: 0,
  });

  const [attendants, setAttendants] = useState([]);
  const [filterType, setFilterType] = useState(1);
  const [period, setPeriod] = useState(0);
  const [dateFrom, setDateFrom] = useState(
    validateAndFormatDate(moment("1", "D").format("YYYY-MM-DD"))
  );
  const [dateTo, setDateTo] = useState(
    validateAndFormatDate(moment().format("YYYY-MM-DD"))
  );
  const [loading, setLoading] = useState(false);
  const [visibleButtonsWithPrint, setVisibleButtonsWithPrint] = useState(true);

  const { find } = useDashboard();

  let newDate = new Date();
  let date = newDate.getDate();
  let month = newDate.getMonth() + 1;
  let year = newDate.getFullYear();
  let now = `${year}-${month < 10 ? `0${month}` : `${month}`}-${
    date < 10 ? `0${date}` : `${date}`
  }`;

  const [showFilter, setShowFilter] = useState(false);
  const [queueTicket, setQueueTicket] = useState(false);

  const { user } = useContext(AuthContext);
  var userQueueIds = [];

  if (user.queues && user.queues.length > 0) {
    userQueueIds = user.queues.map((q) => q.id);
  }

  useEffect(() => {
    async function firstLoad() {
      await fetchData();
    }
    setTimeout(() => {
      firstLoad();
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleChangePeriod(value) {
    setPeriod(value);
  }

  async function handleChangeFilterType(value) {
    setFilterType(value);
    if (value === 1) {
      setPeriod(0);
    } else {
      setDateFrom("");
      setDateTo("");
    }
  }

  async function fetchData() {
    setLoading(true);

    let params = {};

    if (filterType === 1) {
      params = {
        date_from: validateAndFormatDate(dateFrom),
        date_to: validateAndFormatDate(dateTo),
      };
    } else if (period > 0) {
      params = {
        days: period,
      };
    }

    if (Object.keys(params).length === 0) {
      toast.error("Parametrize o filtro");
      setLoading(false);
      return;
    }

    const data = await find(params);

    setCounters(data.counters);
    if (isArray(data.attendants)) {
      setAttendants(data.attendants);
    } else {
      setAttendants([]);
    }

    setLoading(false);
  }

  function formatTime(minutes) {
    return moment()
      .startOf("day")
      .add(minutes, "minutes")
      .format("HH[h] mm[m]");
  }

  const handlePrint = useReactToPrint({
    documentTitle: "Impressão do Dashboard",
    copyStyles: true,
    onBeforePrint: () => {
      // console.log("before printing...");
      // setVisibleButtonsWithPrint(false);
    },
    onAfterPrint: () => {
      console.log("after printing...");
      setVisibleButtonsWithPrint(true);
    },
    removeAfterPrint: true,
  });

  const GetUsers = () => {
    let count;
    let userOnline = 0;
    attendants.forEach((user) => {
      if (user.online === true) {
        userOnline = userOnline + 1;
      }
    });
    count = userOnline === 0 ? 0 : userOnline;
    return count;
  };

  const GetContacts = (all) => {
    let props = {};
    if (all) {
      props = {};
    }
    const { count } = useContacts(props);
    return count;
  };

  function renderFilters() {
    if (filterType === 1) {
      return (
        <>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Data Inicial"
              type="date"
              value={dateFrom}
              onChange={(e) => {
                const validatedDate = validateAndFormatDate(e.target.value);
                setDateFrom(validatedDate);
              }}
              className={classes.fullWidth}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Data Final"
              type="date"
              value={dateTo}
              onChange={(e) => {
                const validatedDate = validateAndFormatDate(e.target.value);
                setDateTo(validatedDate);
              }}
              className={classes.fullWidth}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </>
      );
    } else {
      return (
        <Grid item xs={12} sm={6} md={4}>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="period-selector-label">Período</InputLabel>
            <Select
              labelId="period-selector-label"
              id="period-selector"
              value={period}
              onChange={(e) => handleChangePeriod(e.target.value)}
            >
              <MenuItem value={0}>Nenhum selecionado</MenuItem>
              <MenuItem value={3}>Últimos 3 dias</MenuItem>
              <MenuItem value={7}>Últimos 7 dias</MenuItem>
              <MenuItem value={15}>Últimos 15 dias</MenuItem>
              <MenuItem value={30}>Últimos 30 dias</MenuItem>
              <MenuItem value={60}>Últimos 60 dias</MenuItem>
              <MenuItem value={90}>Últimos 90 dias</MenuItem>
            </Select>
            <FormHelperText>Selecione o período desejado</FormHelperText>
          </FormControl>
        </Grid>
      );
    }
  }

  return (
    <div>
      <Container ref={pageToPrint} maxWidth="lg" className={classes.container}>
        <Grid container spacing={3} justifyContent="flex-end">
		
{/* CONEXÕES */}
{user.super && (
  <Grid item xs={12} sm={6} md={3}>
    <Paper className={classes.card} elevation={4}>
      <Grid container spacing={1} alignItems="center">
        <Grid item xs={8}>
          <Typography component="h3" variant="subtitle1" className={classes.cardTitle}>
            Conexões Ativas
          </Typography>
          <Typography component="h1" variant="h6" className={classes.cardSubtitle}>
            {counters.totalWhatsappSessions}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <MobileFriendlyIcon className={classes.cardIcon} />
        </Grid>
      </Grid>
    </Paper>
  </Grid>
)}

{/* EMPRESAS */}
{user.super && (
  <Grid item xs={12} sm={6} md={3}>
    <Paper className={classes.card} elevation={4}>
      <Grid container spacing={1} alignItems="center">
        <Grid item xs={8}>
          <Typography component="h3" variant="subtitle1" className={classes.cardTitle}>
            Empresas
          </Typography>
          <Typography component="h1" variant="h6" className={classes.cardSubtitle}>
            {counters.totalCompanies}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <StoreIcon className={classes.cardIcon} style={{ color: "#fff" }} />
        </Grid>
      </Grid>
    </Paper>
  </Grid>
)}

{/* EM ATENDIMENTO */}
<Grid item xs={12} sm={6} md={3}>
  <Paper className={classes.card} elevation={4}>
    <Grid container spacing={1} alignItems="center">
      <Grid item xs={8}>
        <Typography component="h3" variant="subtitle1" className={classes.cardTitle}>
          Em Conversa
        </Typography>
        <Typography component="h1" variant="h6" className={classes.cardSubtitle}>
          {counters.supportHappening}
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <CallIcon className={classes.cardIcon} />
      </Grid>
    </Grid>
  </Paper>
</Grid>

{/* AGUARDANDO */}
<Grid item xs={12} sm={6} md={3}>
  <Paper className={classes.card} elevation={6}>
    <Grid container spacing={1} alignItems="center">
      <Grid item xs={8}>
        <Typography component="h3" variant="subtitle1" className={classes.cardTitle}>
          Aguardando
        </Typography>
        <Typography component="h1" variant="h6" className={classes.cardSubtitle}>
          {counters.supportPending}
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <HourglassEmptyIcon className={classes.cardIcon} />
      </Grid>
    </Grid>
  </Paper>
</Grid>

{/* NOVOS CONTATOS */}
<Grid item xs={12} sm={6} md={3}>
  <Paper className={classes.card} elevation={6}>
    <Grid container spacing={1} alignItems="center">
      <Grid item xs={8}>
        <Typography component="h3" variant="subtitle1" className={classes.cardTitle}>
          Novos Contatos
        </Typography>
        <Typography component="h1" variant="h6" className={classes.cardSubtitle}>
          {GetContacts(true)}
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <GroupAddIcon className={classes.cardIcon} />
      </Grid>
    </Grid>
  </Paper>
</Grid>

{/* T.M. DE ATENDIMENTO */}
<Grid item xs={12} sm={6} md={3}>
  <Paper className={classes.card} elevation={6}>
    <Grid container spacing={1} alignItems="center">
      <Grid item xs={8}>
        <Typography component="h3" variant="subtitle1" className={classes.cardTitle}>
          T.M. de Conversa
        </Typography>
        <Typography component="h1" variant="h6" className={classes.cardSubtitle}>
          {formatTime(counters.avgSupportTime)}
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <AccessAlarmIcon className={classes.cardIcon} />
      </Grid>
    </Grid>
  </Paper>
</Grid>

{/* FINALIZADOS */}
<Grid item xs={12} sm={6} md={3}>
  <Paper className={classes.card} elevation={6}>
    <Grid container spacing={1} alignItems="center">
      <Grid item xs={8}>
        <Typography component="h3" variant="subtitle1" className={classes.cardTitle}>
          Finalizados
        </Typography>
        <Typography component="h1" variant="h6" className={classes.cardSubtitle}>
          {counters.supportFinished}
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <CheckCircleIcon className={classes.cardIcon} />
      </Grid>
    </Grid>
  </Paper>
</Grid>


		{/* T.M. DE ESPERA */}
		<Grid item xs={12} sm={6} md={3}>
		  <Paper
			className={classes.card}
			style={{ overflow: "hidden" }}
			elevation={6}
		  >
			<Grid container spacing={1} alignItems="center">
			  {/* Texto */}
			  <Grid item xs={8}>
				<Typography 
				  component="h3" 
				  variant="subtitle1" 
				  className={classes.cardTitle}
				>
				  T.M. de Espera
				</Typography>
				<Typography 
				  component="h1" 
				  variant="h6" 
				  className={classes.cardSubtitle}
				>
				  {formatTime(counters.avgWaitTime)}
				</Typography>
			  </Grid>
			  {/* Ícone */}
			  <Grid item xs={4}>
				<TimerIcon
				  className={classes.cardIcon}
				/>
			  </Grid>
			</Grid>
		  </Paper>
		</Grid>

		  
		  		          {/* FILTROS */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl className={classes.selectContainer}>
              <InputLabel id="period-selector-label">Tipo de Filtro</InputLabel>
              <Select
                labelId="period-selector-label"
                value={filterType}
                onChange={(e) => handleChangeFilterType(e.target.value)}
              >
                <MenuItem value={1}>Filtro por Data</MenuItem>
                <MenuItem value={2}>Filtro por Período</MenuItem>
              </Select>
              <FormHelperText>Selecione o período desejado</FormHelperText>
            </FormControl>
          </Grid>

          {renderFilters()}

          {/* BOTOES DE FILTRO E IMPRESSAO */}
          {visibleButtonsWithPrint && (
            <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
              <Grid item xs={12} className={classes.alignRight}>
                <ButtonWithSpinner
                  loading={loading}
                  onClick={() => fetchData()}
                  variant="contained"
                  color="primary"
                >
                  Filtrar
                </ButtonWithSpinner>
              </Grid>

              <Grid item xs={12} className={classes.alignRight}>
                <ButtonWithSpinner
                  loading={loading}
                  onClick={() => {
                    setVisibleButtonsWithPrint(false);
                    setTimeout(
                      () => handlePrint(null, () => pageToPrint.current),
                      500
                    );
                  }}
                  variant="contained"
                  color="primary"
                >
                  Imprimir
                </ButtonWithSpinner>
              </Grid>
            </div>
          )}

          {/* USUARIOS ONLINE */}
          <Grid item xs={12}>
            {attendants.length ? (
              <TableAttendantsStatus
                attendants={attendants}
                loading={loading}
              />
            ) : null}
          </Grid>

          {/* TOTAL DE ATENDIMENTOS POR USUARIO */}
          <Grid item xs={12}>
            <Paper className={classes.fixedHeightPaper2}>
              <ChatsUser />
            </Paper>
          </Grid>

          {/* TOTAL DE ATENDIMENTOS */}
          <Grid item xs={12}>
            <Paper className={classes.fixedHeightPaper2}>
              <ChartsDate />
            </Paper>
          </Grid>
        </Grid>

        {/* ATENDIMENTOS POR ATENDENTE */}
        <ChartsAppointmentsAtendent />

        {/* HORARIO DE PICOS */}
        <ChartsRushHour />

        {/* MEDIA DE AVALIAÇÔES */}
        <ChartsDepartamentRatings />
      </Container>
    </div>
  );
};

export default Dashboard;
