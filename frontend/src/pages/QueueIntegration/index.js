import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";
import { socketConnection } from "../../services/socket";
import n8n from "../../assets/n8n.png";
import dialogflow from "../../assets/dialogflow.png";
import webhooks from "../../assets/webhook.png";
import typebot from "../../assets/typebot.jpg";
import { styled } from '@mui/material/styles';
import {
  Avatar,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip
} from "@mui/material";
import {
  DeleteOutline as DeleteOutlineIcon,
  Edit as EditIcon,
  Search as SearchIcon
} from "@mui/icons-material";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import IntegrationModal from "../../components/QueueIntegrationModal";
import ConfirmationModal from "../../components/ConfirmationModal";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const reducer = (state, action) => {
  if (action.type === "LOAD_INTEGRATIONS") {
    const queueIntegration = action.payload;
    const newIntegrations = [];

    queueIntegration.forEach((integration) => {
      const integrationIndex = state.findIndex((u) => u.id === integration.id);
      if (integrationIndex !== -1) {
        state[integrationIndex] = integration;
      } else {
        newIntegrations.push(integration);
      }
    });

    return [...state, ...newIntegrations];
  }

  if (action.type === "UPDATE_INTEGRATIONS") {
    const queueIntegration = action.payload;
    const integrationIndex = state.findIndex((u) => u.id === queueIntegration.id);

    if (integrationIndex !== -1) {
      state[integrationIndex] = queueIntegration;
      return [...state];
    } else {
      return [queueIntegration, ...state];
    }
  }

  if (action.type === "DELETE_INTEGRATION") {
    const integrationId = action.payload;

    const integrationIndex = state.findIndex((u) => u.id === integrationId);
    if (integrationIndex !== -1) {
      state.splice(integrationIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const MainPaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  margin: theme.spacing(1),
  overflowY: "scroll",
  ...theme.scrollbarStyles,
}));

const StyledAvatar = styled(Avatar)({
  width: "140px",
  height: "40px",
  borderRadius: 4
});

const QueueIntegration = () => {
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [queueIntegration, dispatch] = useReducer(reducer, []);
  const { user } = useContext(AuthContext);
  const { getPlanCompany } = usePlans();
  const companyId = user.companyId;
  const history = useHistory();

  useEffect(() => {
    async function fetchData() {
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useIntegrations) {
        toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
        setTimeout(() => {
          history.push(`/`)
        }, 1000);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchIntegrations = async () => {
        try {
          const { data } = await api.get("/queueIntegration/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_INTEGRATIONS", payload: data.queueIntegrations });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchIntegrations();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketConnection({ companyId });

    socket.on(`company-${companyId}-queueIntegration`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_INTEGRATIONS", payload: data.queueIntegration });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_INTEGRATION", payload: +data.integrationId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleOpenUserModal = () => {
    setSelectedIntegration(null);
    setUserModalOpen(true);
  };

  const handleCloseIntegrationModal = () => {
    setSelectedIntegration(null);
    setUserModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditIntegration = (queueIntegration) => {
    setSelectedIntegration(queueIntegration);
    setUserModalOpen(true);
  };

  const handleDeleteIntegration = async (integrationId) => {
    try {
      await api.delete(`/queueIntegration/${integrationId}`);
      toast.success(i18n.t("queueIntegration.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingUser(null);
    setSearchParam("");
    setPageNumber(1);
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
      <ConfirmationModal
        title={
          deletingUser &&
          `${i18n.t("queueIntegration.confirmationModal.deleteTitle")} ${deletingUser.name}?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteIntegration(deletingUser.id)}
      >
        {i18n.t("queueIntegration.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <IntegrationModal
        open={userModalOpen}
        onClose={handleCloseIntegrationModal}
        integrationId={selectedIntegration?.id}
      />
      <MainHeader>
        <Title>{i18n.t("queueIntegration.title")} ({queueIntegration.length})</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("queueIntegration.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
            size="small"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenUserModal}
          >
            {i18n.t("queueIntegration.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <MainPaper onScroll={handleScroll}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>{i18n.t("queueIntegration.table.name")}</TableCell>
              <TableCell align="center">{i18n.t("queueIntegration.table.type")}</TableCell>
              <TableCell align="center">{i18n.t("queueIntegration.table.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {queueIntegration.map((integration) => (
                <TableRow key={integration.id}>
                  <TableCell padding="checkbox">
                    <StyledAvatar
                      src={
                        integration.type === "n8n"
                          ? n8n
                          : integration.type === "dialogflow"
                          ? dialogflow
                          : integration.type === "webhook"
                          ? webhooks
                          : typebot
                      }
                    />
                  </TableCell>
                  <TableCell>{integration.name}</TableCell>
                  <TableCell align="center">{integration.type}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditIntegration(integration)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setDeletingUser(integration);
                        setConfirmModalOpen(true);
                      }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={4} />}
            </>
          </TableBody>
        </Table>
      </MainPaper>
    </MainContainer>
  );
};

export default QueueIntegration;
