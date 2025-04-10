import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {
  Paper,
  Container,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TextField,
  FormHelperText,
  Typography,
  Box
} from "@mui/material";

// ICONS
import SpeedIcon from "@mui/icons-material/Speed";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonIcon from "@mui/icons-material/Person";
import TodayIcon from '@mui/icons-material/Today';
import CallIcon from "@mui/icons-material/Call";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import AddIcon from "@mui/icons-material/Add";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ForumIcon from "@mui/icons-material/Forum";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import SendIcon from '@mui/icons-material/Send';
import MessageIcon from '@mui/icons-material/Message';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import TimerIcon from '@mui/icons-material/Timer';

import { grey, blue } from "@mui/material/colors";
import { toast } from "react-toastify";

import Chart from "./Chart";
import ButtonWithSpinner from "../../components/ButtonWithSpinner";
import CardCounter from "../../components/Dashboard/CardCounter";
import TableAttendantsStatus from "../../components/Dashboard/TableAttendantsStatus";
import { isArray, isEmpty } from "lodash";
import useDashboard from "../../hooks/useDashboard";
import useCompanies from "../../hooks/useCompanies";
import moment from "moment";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import Title from "./Title";
import Deposits from "./Deposits";
import Orders from "./Orders";

const PREFIX = "Dashboard";

const classes = {
  paper: `${PREFIX}-paper`,
  fixedHeight: `${PREFIX}-fixedHeight`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.paper}`]: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
  [`& .${classes.fixedHeight}`]: {
    height: 240,
  },
}));

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const FixedHeightPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  height: 240,
  overflowY: "auto",
  ...theme.scrollbarStyles,
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

const SelectContainer = styled(FormControl)({
  width: "100%",
  textAlign: "left",
});

const StyledCard = styled(Paper)(({ theme, color }) => ({
  padding: theme.spacing(2),
  display: "flex",
  overflow: "auto",
  flexDirection: "column",
  height: "100%",
  backgroundColor: color,
  color: "#eee",
}));

const Dashboard = () => {
  const [counters, setCounters] = useState({});
  const [attendants, setAttendants] = useState([]);
  const [filterType, setFilterType] = useState(1);
  const [period, setPeriod] = useState(0);
  const [companyDueDate, setCompanyDueDate] = useState();
  const [dateFrom, setDateFrom] = useState(
    moment("1", "D").format("YYYY-MM-DD")
  );
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);
  const { find } = useDashboard();
  const { finding } = useCompanies();
  const [dashboardData, setDashboardData] = useState({
    tickets: [],
    connections: [],
    messages: [],
  });

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

    if (period > 0) {
      params = {
        days: period,
      };
    }

    if (!isEmpty(dateFrom) && moment(dateFrom).isValid()) {
      params = {
        ...params,
        date_from: moment(dateFrom).format("YYYY-MM-DD"),
      };
    }

    if (!isEmpty(dateTo) && moment(dateTo).isValid()) {
      params = {
        ...params,
        date_to: moment(dateTo).format("YYYY-MM-DD"),
      };
    }

    try {
      const { data } = await find(params);
      setCounters(data.counters);
      setAttendants(data.attendants);
      setDashboardData(data);
    } catch (err) {
      toast.error(i18n.t("dashboard.messages.loadError"));
    } finally {
      setLoading(false);
    }
  }

  const loadCompanies = async () => {
    try {
      const { data } = await finding();
      setCompanyDueDate(data.dueDate);
    } catch (err) {
      toast.error("Erro ao carregar dados da empresa");
    }
  };

  function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  function renderFilters() {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <SelectContainer>
            <InputLabel>Tipo de Filtro</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => handleChangeFilterType(e.target.value)}
              label="Tipo de Filtro"
            >
              <MenuItem value={1}>Período</MenuItem>
              <MenuItem value={2}>Data Específica</MenuItem>
            </Select>
          </SelectContainer>
        </Grid>
        {filterType === 1 ? (
          <Grid item xs={12} sm={4}>
            <SelectContainer>
              <InputLabel>Período</InputLabel>
              <Select
                value={period}
                onChange={(e) => handleChangePeriod(e.target.value)}
                label="Período"
              >
                <MenuItem value={0}>Hoje</MenuItem>
                <MenuItem value={7}>Últimos 7 dias</MenuItem>
                <MenuItem value={15}>Últimos 15 dias</MenuItem>
                <MenuItem value={30}>Últimos 30 dias</MenuItem>
              </Select>
            </SelectContainer>
          </Grid>
        ) : (
          <>
            <Grid item xs={12} sm={4}>
              <TextField
                type="date"
                label="Data Inicial"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                type="date"
                label="Data Final"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </>
        )}
        <Grid item xs={12} sm={4}>
          <ButtonWithSpinner
            loading={loading}
            onClick={fetchData}
            variant="contained"
            color="primary"
            fullWidth
          >
            Filtrar
          </ButtonWithSpinner>
        </Grid>
      </Grid>
    );
  }

  return (
    <Root>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8} lg={9}>
          <Paper className={classes.paper}>
            <Chart data={dashboardData} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <Paper className={classes.paper}>
            <Deposits data={dashboardData} />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Orders data={dashboardData} />
          </Paper>
        </Grid>
      </Grid>
    </Root>
  );
};

export default Dashboard;
