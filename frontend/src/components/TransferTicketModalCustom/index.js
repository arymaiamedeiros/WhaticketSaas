import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { 
    Button,
    TextField,
    Dialog,
    Select,
    FormControl,
    InputLabel,
    MenuItem,
    Grid,
    ListItemText,
    Typography,
    DialogActions,
    DialogContent,
    DialogTitle,
    CircularProgress,
    Autocomplete
} from "@mui/material";
import { createFilterOptions } from '@mui/material/Autocomplete';

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import toastError from "../../errors/toastError";
import useQueues from "../../hooks/useQueues";
import { AuthContext } from "../../context/Auth/AuthContext";

const StyledFormControl = styled(FormControl)({
    width: "100%"
});

const filterOptions = createFilterOptions({
    trim: true,
});

const TransferTicketModalCustom = ({ modalOpen, onClose, ticketid }) => {
    const navigate = useNavigate();
    const [options, setOptions] = useState([]);
    const [queues, setQueues] = useState([]);
    const [allQueues, setAllQueues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchParam, setSearchParam] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedQueue, setSelectedQueue] = useState("");
    const { findAll: findAllQueues } = useQueues();
    const isMounted = useRef(true);
    const [whatsapps, setWhatsapps] = useState([]);
    const [selectedWhatsapp, setSelectedWhatsapp] = useState("");
    const { user } = useContext(AuthContext);
    const { companyId, whatsappId } = user;

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setLoading(true);
        const delayDebounceFn = setTimeout(() => {
            const fetchContacts = async () => {
                api
                    .get(`/whatsapp`, { params: { companyId, session: 0 } })
                    .then(({ data }) => setWhatsapps(data));
            };

            if (whatsappId !== null && whatsappId !== undefined) {
                setSelectedWhatsapp(whatsappId)
            }

            if (user.queues.length === 1) {
                setSelectedQueue(user.queues[0].id)
            }
            fetchContacts();
            setLoading(false);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [])

    useEffect(() => {
        if (isMounted.current) {
            const loadQueues = async () => {
                const list = await findAllQueues();
                setAllQueues(list);
                setQueues(list);
            };
            loadQueues();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!modalOpen || searchParam.length < 3) {
            setLoading(false);
            return;
        }
        const delayDebounceFn = setTimeout(() => {
            setLoading(true);
            const fetchUsers = async () => {
                try {
                    const { data } = await api.get("/users/", {
                        params: { searchParam },
                    });
                    setOptions(data.users);
                    setLoading(false);
                } catch (err) {
                    setLoading(false);
                    toastError(err);
                }
            };

            fetchUsers();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchParam, modalOpen]);

    const handleClose = () => {
        onClose();
        setSearchParam("");
        setSelectedUser(null);
    };

    const handleSaveTicket = async (e) => {
        e.preventDefault();
        if (!ticketid) return;
        if (!selectedQueue || selectedQueue === "") return;
        setLoading(true);
        try {
            let data = {};

            if (selectedUser) {
                data.userId = selectedUser.id;
            }

            if (selectedQueue && selectedQueue !== null) {
                data.queueId = selectedQueue;

                if (!selectedUser) {
                    data.status = "pending";
                    data.userId = null;
                }
            }

            if (selectedWhatsapp) {
                data.whatsappId = selectedWhatsapp
            }
            await api.put(`/tickets/${ticketid}`, data);

            navigate("/tickets");
        } catch (err) {
            setLoading(false);
            toastError(err);
        }
    };

    return (
        <Dialog open={modalOpen} onClose={handleClose} maxWidth="lg" scroll="paper">
            <form onSubmit={handleSaveTicket}>
                <DialogTitle id="form-dialog-title">
                    {i18n.t("transferTicketModal.title")}
                </DialogTitle>
                <DialogContent dividers>
                    <Autocomplete
                        style={{ width: 300, marginBottom: 20 }}
                        getOptionLabel={(option) => `${option.name}`}
                        onChange={(e, newValue) => {
                            setSelectedUser(newValue);
                            if (newValue != null && Array.isArray(newValue.queues)) {
                                setQueues(newValue.queues);
                            } else {
                                setQueues(allQueues);
                                setSelectedQueue("");
                            }
                        }}
                        options={options}
                        filterOptions={filterOptions}
                        freeSolo
                        autoHighlight
                        noOptionsText={i18n.t("transferTicketModal.noOptions")}
                        loading={loading}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={i18n.t("transferTicketModal.fieldLabel")}
                                variant="outlined"
                                autoFocus
                                onChange={(e) => setSearchParam(e.target.value)}
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <React.Fragment>
                                            {loading ? (
                                                <CircularProgress color="inherit" size={20} />
                                            ) : null}
                                            {params.InputProps.endAdornment}
                                        </React.Fragment>
                                    ),
                                }}
                            />
                        )}
                    />
                    <StyledFormControl variant="outlined">
                        <InputLabel>
                            {i18n.t("transferTicketModal.fieldQueueLabel")}
                        </InputLabel>
                        <Select
                            value={selectedQueue}
                            onChange={(e) => setSelectedQueue(e.target.value)}
                            label={i18n.t("transferTicketModal.fieldQueuePlaceholder")}
                        >
                            {queues.map((queue) => (
                                <MenuItem key={queue.id} value={queue.id}>
                                    {queue.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </StyledFormControl>
                    {/* CONEXAO */}
                    <Grid container spacing={2} style={{marginTop: '15px'}}>
                        <Grid xs={12} item>
                            <Select
                                required
                                fullWidth
                                displayEmpty
                                variant="outlined"
                                value={selectedWhatsapp}
                                onChange={(e) => {
                                    setSelectedWhatsapp(e.target.value)
                                }}
                                MenuProps={{
                                    anchorOrigin: {
                                        vertical: "bottom",
                                        horizontal: "left",
                                    },
                                    transformOrigin: {
                                        vertical: "top",
                                        horizontal: "left",
                                    },
                                    getContentAnchorEl: null,
                                }}
                                renderValue={() => {
                                    if (selectedWhatsapp === "") {
                                        return "Selecione uma Conexão"
                                    }
                                    const whatsapp = whatsapps.find(w => w.id === selectedWhatsapp)
                                    return whatsapp.name
                                }}
                            >
                                {whatsapps?.length > 0 &&
                                    whatsapps.map((whatsapp) => (
                                        <MenuItem key={whatsapp.id} value={whatsapp.id}>
                                            {whatsapp.name}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        {i18n.t("transferTicketModal.buttons.cancel")}
                    </Button>
                    <ButtonWithSpinner
                        variant="contained"
                        type="submit"
                        color="primary"
                        loading={loading}
                    >
                        {i18n.t("transferTicketModal.buttons.ok")}
                    </ButtonWithSpinner>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default TransferTicketModalCustom;
