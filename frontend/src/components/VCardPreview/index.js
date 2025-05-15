import React, { useEffect, useState, useContext } from 'react';
import { useHistory } from "react-router-dom";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Modal from "@material-ui/core/Modal";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Button, Divider, } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles"; // Importar useTheme
import NewTicketModal from "../NewTicketModal";

const VCardPreview = ({ contact, numbers }) => {
    const history = useHistory();
    const { user } = useContext(AuthContext);
    const theme = useTheme(); // Usar o hook useTheme para acessar o tema

    const [selectedContact, setContact] = useState({
        name: "",
        number: 0,
        profilePicUrl: ""
    });

	const [selectedQueue, setSelectedQueue] = useState("");
	const [isModalOpen, setModalOpen] = useState(false);
    const [isContactValid, setContactValid] = useState(true);
    const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
    const [contactTicket, setContactTicket] = useState({});

	const handleQueueSelection = async (queueId) => {
        setSelectedQueue(queueId);
        setModalOpen(false);
        if (queueId !== "") {
            await createTicket(queueId);
        }
    };

    const renderQueueModal = () => {
        return (
            <Modal open={isModalOpen} onClose={() => setModalOpen(false)}>
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: theme.palette.background.paper,
                    padding: "20px",
                    outline: "none",
                }}>
                    <h2>Selecione a Fila</h2>
                    {user.queues.map((queue) => (
                        <div key={queue.id}>
                            <Button onClick={() => handleQueueSelection(queue.id)}>
                                {queue.name}
                            </Button>
                        </div>
                    ))}
                </div>
            </Modal>
        );
    };

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                let contactObj = {
                    name: contact,
                    number: numbers.replace(/\D/g, ""),
                    email: ""
                };

                const { data } = await api.post("/contacts", contactObj);

                if (data.alreadyExists) {
                    setContact(data.existingContact);
                } else {
                    setContact(contactObj);
                }
            
            	if(data.invalido){
        			setContactValid(false);
                }
            } catch (err) {
                toastError(err);
            }
        };

        const delayDebounceFn = setTimeout(fetchContacts, 1500);
        return () => clearTimeout(delayDebounceFn);
    }, [contact, numbers]);

	const handleNewChat = () => {
    	if (selectedQueue === "") {
        	setModalOpen(true);
    	} else {
        	createTicket();
    	}
	};

    const createTicket = async (queueId) => {
        try {
            let contactId = selectedContact.id;

            if (!contactId) {
                const contactObj = {
                    name: selectedContact.name,
                    number: selectedContact.number,
                    email: ""
                };

                const { data } = await api.post("/contacts", contactObj);
                contactId = data.existingContact.id;
            }

            const { data: ticket } = await api.post("/tickets", {
                contactId,
                queueId,
                userId: user.id,
                status: "open",
            });
            
            history.push(`/tickets/${ticket.uuid}`);
        } catch (err) {
            toastError(err);
        }
    };

    const handleCloseOrOpenTicket = (ticket) => {
        setNewTicketModalOpen(false);
        if (ticket !== undefined && ticket.uuid !== undefined) {
            history.push(`/tickets/${ticket.uuid}`);
        }
    };

    return (
        <>
    		{renderQueueModal()}
            <div style={{
                minWidth: "250px",
            }}>
            <NewTicketModal
                modalOpen={newTicketModalOpen}
                initialContact={selectedContact}
                onClose={(ticket) => {
                    handleCloseOrOpenTicket(ticket);
                }}
            />
                <Grid container spacing={1}>
                    <Grid item xs={1}>
                        <Avatar src={selectedContact.profilePicUrl} />
                    </Grid>
                    <Grid item xs={9}>
                        <Typography style={{ marginTop: "12px", marginLeft: "10px", color: theme.palette.text.vcard }} variant="subtitle1" gutterBottom>
                            {selectedContact.name}
                        </Typography>
                    </Grid>
					<Grid item xs={9}>
                        <Typography style={{ marginLeft: "10px", color: theme.palette.text.vcard }} variant="body2" gutterBottom>
                            <strong>Nome:</strong> {selectedContact.name}
                        </Typography>
                        <Typography style={{ marginLeft: "10px", color: theme.palette.text.vcard }} variant="body2" gutterBottom>
                            <Typography variant="body2" component="span">
                                <strong>Telefone:</strong> {selectedContact.number}
                            </Typography>
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Divider />
                        <Button
                            fullWidth
                            color="theme.palette.text.vcard"
                            onClick={() => {
                                setContactTicket(selectedContact);
                                setNewTicketModalOpen(true);
                            }}
                            disabled={!selectedContact.number || !isContactValid}
                        >
                            {isContactValid  ? "Conversar (Novo Ticket)" : "CONTATO FORA DO WHATSAPP"}
                        </Button>
                    </Grid>
                </Grid>
            </div>
        </>
    );
};

export default VCardPreview;
