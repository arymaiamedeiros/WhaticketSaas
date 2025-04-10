import React, { useState, useEffect, useReducer } from 'react';
import { styled } from '@mui/material/styles';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Star as StarIcon,
  Minimize as MinimizeIcon,
  Add as AddIcon,
} from '@mui/icons-material';

import usePlans from "../../../hooks/usePlans";
import useCompanies from "../../../hooks/useCompanies";

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[700],
}));

const CardPricing = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'baseline',
  marginBottom: theme.spacing(2),
}));

const Footer = styled('div')(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.divider}`,
  marginTop: theme.spacing(8),
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  [theme.breakpoints.up('sm')]: {
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(6),
  },
}));

const CustomCard = styled('div')({
  display: "flex",
  marginTop: "16px",
  alignItems: "center",
  flexDirection: "column",
});

const Custom = styled('div')({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

const GlobalStyles = styled('div')({
  '& ul': {
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
});

export default function Pricing(props) {
  const {
    setFieldValue,
    setActiveStep,
    activeStep,
  } = props;

  const handleChangeAdd = (event, newValue) => {
    if (newValue < 3) return;

    const newPrice = 11.00;
    setUsersPlans(newValue);
    setCustomValuePlans(customValuePlans + newPrice);
  };

  const handleChangeMin = (event, newValue) => {
    if (newValue < 3) return;

    const newPrice = 11;
    setUsersPlans(newValue);
    setCustomValuePlans(customValuePlans - newPrice);
  };

  const handleChangeConnectionsAdd = (event, newValue) => {
    if (newValue < 3) return;
    const newPrice = 20.00;
    setConnectionsPlans(newValue);
    setCustomValuePlans(customValuePlans + newPrice);
  };

  const handleChangeConnectionsMin = (event, newValue) => {
    if (newValue < 3) return;
    const newPrice = 20;
    setConnectionsPlans(newValue);
    setCustomValuePlans(customValuePlans - newPrice);
  };

  const { list, finder } = usePlans();
  const { find } = useCompanies();

  const [usersPlans, setUsersPlans] = React.useState(3);
  const [companiesPlans, setCompaniesPlans] = useState(0);
  const [connectionsPlans, setConnectionsPlans] = React.useState(3);
  const [storagePlans, setStoragePlans] = React.useState([]);
  const [customValuePlans, setCustomValuePlans] = React.useState(49.00);
  const [loading, setLoading] = React.useState(false);
  const companyId = localStorage.getItem("companyId");

  useEffect(() => {
    async function fetchData() {
      await loadCompanies();
    }
    fetchData();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const companiesList = await find(companyId);
      setCompaniesPlans(companiesList.planId);
      await loadPlans(companiesList.planId);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const loadPlans = async (companiesPlans) => {
    setLoading(true);
    try {
      const plansCompanies = await finder(companiesPlans);
      const plans = [];

      plans.push({
        title: plansCompanies.name,
        planId: plansCompanies.id,
        price: plansCompanies.value,
        description: [
          `${plansCompanies.users} Usuários`,
          `${plansCompanies.connections} Conexão`,
          `${plansCompanies.queues} Filas`
        ],
        users: plansCompanies.users,
        connections: plansCompanies.connections,
        queues: plansCompanies.queues,
        buttonText: 'SELECIONAR',
        buttonVariant: 'outlined',
      });

      setStoragePlans(plans);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const tiers = storagePlans;

  return (
    <React.Fragment>
      <GlobalStyles />
      <Grid container spacing={3}>
        {tiers.map((tier) => (
          <Grid item key={tier.title} xs={12} sm={12} md={12}>
            <Card>
              <StyledCardHeader
                title={tier.title}
                subheader={tier.subheader}
                titleTypographyProps={{ align: 'center' }}
                subheaderTypographyProps={{ align: 'center' }}
                action={tier.title === 'Pro' ? <StarIcon /> : null}
              />
              <CardContent>
                <CardPricing>
                  <Typography component="h2" variant="h3" color="textPrimary">
                    <React.Fragment>
                      R${tier.price.toLocaleString('pt-br', { minimumFractionDigits: 2 })}
                    </React.Fragment>
                  </Typography>
                  <Typography variant="h6" color="textSecondary">
                    /mês
                  </Typography>
                </CardPricing>
                <ul>
                  {tier.description.map((line) => (
                    <Typography component="li" variant="subtitle1" align="center" key={line}>
                      {line}
                    </Typography>
                  ))}
                </ul>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant={tier.buttonVariant}
                  color="primary"
                  onClick={() => {
                    if (tier.custom) {
                      setFieldValue("plan", JSON.stringify({
                        users: usersPlans,
                        connections: connectionsPlans,
                        price: customValuePlans,
                      }));
                    } else {
                      setFieldValue("plan", JSON.stringify(tier));
                    }
                    setActiveStep(activeStep + 1);
                  }}
                >
                  {tier.buttonText}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </React.Fragment>
  );
}
