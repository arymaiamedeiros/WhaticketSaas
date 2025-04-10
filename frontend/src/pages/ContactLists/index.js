import React, { useState, useEffect, useReducer } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
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
  People as PeopleIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material';

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactListDialog from "../../components/ContactListDialog";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import planilhaExemplo from "../../assets/planilha.xlsx";
import { socketConnection } from "../../services/socket";

const MainPaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(1),
  overflowY: "scroll",
  ...theme.scrollbarStyles,
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTLISTS") {
    const contactLists = action.payload;
    const newContactLists = [];

    contactLists.forEach((contactList) => {
      const contactListIndex = state.findIndex((u) => u.id === contactList.id);
      if (contactListIndex !== -1) {
        state[contactListIndex] = contactList;
      } else {
        newContactLists.push(contactList);
      }
    });

    return [...state, ...newContactLists];
  }

  if (action.type === "UPDATE_CONTACTLIST") {
    const contactList = action.payload;
    const contactListIndex = state.findIndex((u) => u.id === contactList.id);

    if (contactListIndex !== -1) {
      state[contactListIndex] = contactList;
      return [...state];
    } else {
      return [contactList, ...state];
    }
  }

  if (action.type === "DELETE_CONTACTLIST") {
    const contactListId = action.payload;

    const contactListIndex = state.findIndex((u) => u.id === contactListId);
    if (contactListIndex !== -1) {
      state.splice(contactListIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const ContactLists = () => {
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedContactList, setSelectedContactList] = useState(null);
  const [deletingContactList, setDeletingContactList] = useState(null);
  const [contactListModalOpen, setContactListModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [contactLists, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContactLists = async () => {
        try {
          const { data } = await api.get("/contact-lists/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_CONTACTLISTS", payload: data.records });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchContactLists();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketConnection({ companyId });

    socket.on(`company-${companyId}-ContactList`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTLIST", payload: data.record });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACTLIST", payload: +data.id });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleOpenContactListModal = () => {
    setSelectedContactList(null);
    setContactListModalOpen(true);
  };

  const handleCloseContactListModal = () => {
    setSelectedContactList(null);
    setContactListModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditContactList = (contactList) => {
    setSelectedContactList(contactList);
    setContactListModalOpen(true);
  };

  const handleDeleteContactList = async (contactListId) => {
    try {
      await api.delete(`/contact-lists/${contactListId}`);
      toast.success(i18n.t("contactLists.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingContactList(null);
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

  const goToContacts = (id) => {
    history.push(`/contact-lists/${id}/contacts`);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingContactList &&
          `${i18n.t("contactLists.confirmationModal.deleteTitle")} ${
            deletingContactList.name
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteContactList(deletingContactList.id)}
      >
        {i18n.t("contactLists.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <ContactListDialog
        open={contactListModalOpen}
        onClose={handleCloseContactListModal}
        aria-labelledby="form-dialog-title"
        contactListId={selectedContactList && selectedContactList.id}
      />
      <MainHeader>
        <Grid container sx={{ width: "99.6%" }}>
          <Grid item xs={12} sm={8}>
            <Title>{i18n.t("contactLists.title")}</Title>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Grid container spacing={2}>
              <Grid item xs={7} sm={6}>
                <TextField
                  fullWidth
                  placeholder={i18n.t("contacts.searchPlaceholder")}
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
                  onClick={handleOpenContactListModal}
                >
                  {i18n.t("contactLists.buttons.add")}
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
              <TableCell>{i18n.t("contactLists.table.name")}</TableCell>
              <TableCell align="center">
                {i18n.t("contactLists.table.contacts")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("contactLists.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {contactLists.map((contactList) => (
                <TableRow key={contactList.id}>
                  <TableCell>{contactList.name}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => goToContacts(contactList.id)}
                    >
                      <PeopleIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditContactList(contactList)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setDeletingContactList(contactList);
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

export default ContactLists;
