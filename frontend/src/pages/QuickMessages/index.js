import React, { useState, useEffect, useReducer, useContext, useCallback } from "react";
import { toast } from "react-toastify";
import { styled } from '@mui/material/styles';
import {
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  InputAdornment,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  DeleteOutline as DeleteOutlineIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import QuickMessageDialog from "../../components/QuickMessageDialog";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { isArray } from "lodash";
import { socketConnection } from "../../services/socket";
import { AuthContext } from "../../context/Auth/AuthContext";

const MainPaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(1),
  overflowY: "scroll",
  ...theme.scrollbarStyles,
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_QUICKMESSAGES") {
    const quickmessages = action.payload;
    const newQuickmessages = [];

    if (isArray(quickmessages)) {
      quickmessages.forEach((quickemessage) => {
        const quickemessageIndex = state.findIndex(
          (u) => u.id === quickemessage.id
        );
        if (quickemessageIndex !== -1) {
          state[quickemessageIndex] = quickemessage;
        } else {
          newQuickmessages.push(quickemessage);
        }
      });
    }

    return [...state, ...newQuickmessages];
  }

  if (action.type === "UPDATE_QUICKMESSAGES") {
    const quickemessage = action.payload;
    const quickemessageIndex = state.findIndex((u) => u.id === quickemessage.id);

    if (quickemessageIndex !== -1) {
      state[quickemessageIndex] = quickemessage;
      return [...state];
    } else {
      return [quickemessage, ...state];
    }
  }

  if (action.type === "DELETE_QUICKMESSAGE") {
    const quickemessageId = action.payload;

    const quickemessageIndex = state.findIndex((u) => u.id === quickemessageId);
    if (quickemessageIndex !== -1) {
      state.splice(quickemessageIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const QuickMessages = () => {
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedQuickMessage, setSelectedQuickMessage] = useState(null);
  const [deletingQuickMessage, setDeletingQuickMessage] = useState(null);
  const [quickMessageModalOpen, setQuickMessageDialogOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [quickMessages, dispatch] = useReducer(reducer, []);
  const { user } = useContext(AuthContext);
  const { profile } = user;

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchQuickMessages();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = user.companyId;
    const socket = socketConnection({ companyId, userId: user.id });

    socket.on(`company${companyId}-quickmessage`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_QUICKMESSAGES", payload: data.record });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_QUICKMESSAGE", payload: +data.id });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchQuickMessages = async () => {
    try {
      const { data } = await api.get("/quick-messages", {
        params: { searchParam, pageNumber, userId: user.id },
      });

      dispatch({ type: "LOAD_QUICKMESSAGES", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenQuickMessageDialog = () => {
    setSelectedQuickMessage(null);
    setQuickMessageDialogOpen(true);
  };

  const handleCloseQuickMessageDialog = () => {
    setSelectedQuickMessage(null);
    setQuickMessageDialogOpen(false);
    fetchQuickMessages();
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditQuickMessage = (quickMessage) => {
    setSelectedQuickMessage(quickMessage);
    setQuickMessageDialogOpen(true);
  };

  const handleDeleteQuickMessage = async (quickMessageId) => {
    try {
      await api.delete(`/quick-messages/${quickMessageId}`);
      toast.success(i18n.t("quickMessages.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingQuickMessage(null);
    setSearchParam("");
    setPageNumber(1);
    fetchQuickMessages();
    dispatch({ type: "RESET" });
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
        title={deletingQuickMessage && `${i18n.t("quickMessages.confirmationModal.deleteTitle")} ${deletingQuickMessage.shortcode}?`}
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteQuickMessage(deletingQuickMessage.id)}
      >
        {i18n.t("quickMessages.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <QuickMessageDialog
        resetPagination={() => {
          setPageNumber(1);
          fetchQuickMessages();
        }}
        open={quickMessageModalOpen}
        onClose={handleCloseQuickMessageDialog}
        aria-labelledby="form-dialog-title"
        quickMessageId={selectedQuickMessage && selectedQuickMessage.id}
      />
      <MainHeader>
        <Grid container sx={{ width: "99.6%" }}>
          <Grid item xs={12} sm={8}>
            <Title>{i18n.t("quickMessages.title")}</Title>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Grid container spacing={2}>
              <Grid item xs={7} sm={6}>
                <TextField
                  fullWidth
                  placeholder={i18n.t("quickMessages.searchPlaceholder")}
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
              </Grid>
              <Grid item xs={5} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleOpenQuickMessageDialog}
                >
                  {i18n.t("quickMessages.buttons.add")}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </MainHeader>
      <MainPaper variant="outlined" onScroll={handleScroll}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{i18n.t("quickMessages.table.shortcode")}</TableCell>
              <TableCell>{i18n.t("quickMessages.table.message")}</TableCell>
              <TableCell align="center">
                {i18n.t("quickMessages.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {quickMessages.map((quickMessage) => (
                <TableRow key={quickMessage.id}>
                  <TableCell>{quickMessage.shortcode}</TableCell>
                  <TableCell>{quickMessage.message}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditQuickMessage(quickMessage)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setDeletingQuickMessage(quickMessage);
                        setConfirmModalOpen(true);
                      }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={3} />}
            </>
          </TableBody>
        </Table>
      </MainPaper>
    </MainContainer>
  );
};

export default QuickMessages;
