import React, { useState, useEffect } from "react";
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
  Box,
  Typography,
  Chip
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import HelpModal from "./HelpModal";
import ConfirmationModal from "../ConfirmationModal";

const MainPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const HelpsManager = () => {
  const [helps, setHelps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParam, setSearchParam] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedHelp, setSelectedHelp] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [helpToDelete, setHelpToDelete] = useState(null);

  useEffect(() => {
    loadHelps();
  }, []);

  const loadHelps = async () => {
    try {
      const { data } = await api.get("/helps");
      setHelps(data);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const filteredHelps = helps.filter((help) => {
    return (
      help.title.toLowerCase().includes(searchParam) ||
      help.description?.toLowerCase().includes(searchParam) ||
      help.category?.toLowerCase().includes(searchParam)
    );
  });

  const handleOpenModal = () => {
    setSelectedHelp(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedHelp(null);
    setShowModal(false);
  };

  const handleEdit = (help) => {
    setSelectedHelp(help);
    setShowModal(true);
  };

  const handleDelete = async (helpId) => {
    try {
      await api.delete(`/helps/${helpId}`);
      toast.success(i18n.t("helpsManager.toasts.deleted"));
      loadHelps();
    } catch (err) {
      toastError(err);
    }
    setHelpToDelete(null);
    setShowDeleteModal(false);
  };

  return (
    <MainPaper>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">
          {i18n.t("helpsManager.title")}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
        >
          {i18n.t("helpsManager.buttons.add")}
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder={i18n.t("helpsManager.searchPlaceholder")}
        type="search"
        value={searchParam}
        onChange={handleSearch}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{i18n.t("helpsManager.table.title")}</TableCell>
            <TableCell>{i18n.t("helpsManager.table.description")}</TableCell>
            <TableCell>{i18n.t("helpsManager.table.category")}</TableCell>
            <TableCell>{i18n.t("helpsManager.table.status")}</TableCell>
            <TableCell align="right">
              {i18n.t("helpsManager.table.actions")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredHelps.map((help) => (
            <TableRow key={help.id}>
              <TableCell>{help.title}</TableCell>
              <TableCell>{help.description}</TableCell>
              <TableCell>{help.category}</TableCell>
              <TableCell>
                <Chip
                  label={help.isActive ? i18n.t("helpsManager.status.active") : i18n.t("helpsManager.status.inactive")}
                  color={help.isActive ? "success" : "error"}
                  size="small"
                />
              </TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  onClick={() => handleEdit(help)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    setHelpToDelete(help);
                    setShowDeleteModal(true);
                  }}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <HelpModal
        open={showModal}
        onClose={handleCloseModal}
        help={selectedHelp}
        onSave={loadHelps}
      />

      <ConfirmationModal
        title={i18n.t("helpsManager.deleteModal.title")}
        open={showDeleteModal}
        onClose={() => {
          setHelpToDelete(null);
          setShowDeleteModal(false);
        }}
        onConfirm={() => handleDelete(helpToDelete?.id)}
      >
        {i18n.t("helpsManager.deleteModal.message")}
      </ConfirmationModal>
    </MainPaper>
  );
};

export default HelpsManager;
