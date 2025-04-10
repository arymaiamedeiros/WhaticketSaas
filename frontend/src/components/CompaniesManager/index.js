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
  Typography
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
import CompanyModal from "./CompanyModal";
import ConfirmationModal from "../ConfirmationModal";

const MainPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const CompaniesManager = () => {
  const [companies, setCompanies] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParam, setSearchParam] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);

  useEffect(() => {
    loadCompanies();
    loadPlans();
  }, []);

  const loadCompanies = async () => {
    try {
      const { data } = await api.get("/companies");
      setCompanies(data);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const { data } = await api.get("/plans");
      setPlans(data);
    } catch (err) {
      toastError(err);
    }
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const filteredCompanies = companies.filter((company) => {
    return (
      company.name.toLowerCase().includes(searchParam) ||
      company.email.toLowerCase().includes(searchParam) ||
      (company.phone && company.phone.toLowerCase().includes(searchParam))
    );
  });

  const handleOpenModal = () => {
    setSelectedCompany(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedCompany(null);
    setShowModal(false);
  };

  const handleEdit = (company) => {
    setSelectedCompany(company);
    setShowModal(true);
  };

  const handleDelete = async (companyId) => {
    try {
      await api.delete(`/companies/${companyId}`);
      toast.success(i18n.t("companiesManager.toasts.deleted"));
      loadCompanies();
    } catch (err) {
      toastError(err);
    }
    setCompanyToDelete(null);
    setShowDeleteModal(false);
  };

  return (
    <MainPaper>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">
          {i18n.t("companiesManager.title")}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
        >
          {i18n.t("companiesManager.buttons.add")}
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder={i18n.t("companiesManager.searchPlaceholder")}
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
            <TableCell>{i18n.t("companiesManager.table.name")}</TableCell>
            <TableCell>{i18n.t("companiesManager.table.email")}</TableCell>
            <TableCell>{i18n.t("companiesManager.table.phone")}</TableCell>
            <TableCell>{i18n.t("companiesManager.table.plan")}</TableCell>
            <TableCell>{i18n.t("companiesManager.table.status")}</TableCell>
            <TableCell align="right">
              {i18n.t("companiesManager.table.actions")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredCompanies.map((company) => (
            <TableRow key={company.id}>
              <TableCell>{company.name}</TableCell>
              <TableCell>{company.email}</TableCell>
              <TableCell>{company.phone}</TableCell>
              <TableCell>
                {plans.find((p) => p.id === company.planId)?.name}
              </TableCell>
              <TableCell>
                {company.status
                  ? i18n.t("companiesManager.status.active")
                  : i18n.t("companiesManager.status.inactive")}
              </TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  onClick={() => handleEdit(company)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    setCompanyToDelete(company);
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

      <CompanyModal
        open={showModal}
        onClose={handleCloseModal}
        company={selectedCompany}
        onSave={loadCompanies}
        plans={plans}
      />

      <ConfirmationModal
        title={i18n.t("companiesManager.deleteModal.title")}
        open={showDeleteModal}
        onClose={() => {
          setCompanyToDelete(null);
          setShowDeleteModal(false);
        }}
        onConfirm={() => handleDelete(companyToDelete?.id)}
      >
        {i18n.t("companiesManager.deleteModal.message")}
      </ConfirmationModal>
    </MainPaper>
  );
};

export default CompaniesManager;
