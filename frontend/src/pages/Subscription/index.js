import React, { useState, useContext } from "react";
import { styled } from "@mui/material/styles";
import {
  Paper,
  Button,
  Grid,
  TextField,
} from "@mui/material";
import SubscriptionModal from "../../components/SubscriptionModal";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainContainer from "../../components/MainContainer";
import { AuthContext } from "../../context/Auth/AuthContext";

const MainPaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(1),
  overflowY: "scroll",
  ...theme.scrollbarStyles,
}));

const FormContainer = styled("div")(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

const _formatDate = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diff = Math.abs(now.getTime() - past.getTime());
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days;
};

const Subscription = () => {
  const { user } = useContext(AuthContext);
  const [loading] = useState(false);
  const [, setPageNumber] = useState(1);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [hasMore] = useState(false);

  const handleOpenContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  return (
    <MainContainer>
      <SubscriptionModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        contactId={selectedContactId}
      />
      <MainHeader>
        <Title>Assinatura</Title>
      </MainHeader>
      <Grid item xs={12} sm={4}>
        <MainPaper
          variant="outlined"
          onScroll={handleScroll}
        >
          <FormContainer>
            <TextField
              id="outlined-full-width"
              label="Período de teste"
              defaultValue={`Seu período de teste termina em ${_formatDate(user?.company?.trialExpiration)} dias!`}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />
            <TextField
              id="outlined-full-width"
              label="Email de cobrança"
              defaultValue={user?.company?.email}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenContactModal}
              fullWidth
            >
              Assine Agora!
            </Button>
          </FormContainer>
        </MainPaper>
      </Grid>
    </MainContainer>
  );
};

export default Subscription;
