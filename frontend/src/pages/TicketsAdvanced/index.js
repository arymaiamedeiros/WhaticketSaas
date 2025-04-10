import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ChatIcon from '@mui/icons-material/Chat';

import TicketsManagerTabs from "../../components/TicketsManagerTabs/";
import Ticket from "../../components/Ticket/";
import TicketAdvancedLayout from "../../components/TicketAdvancedLayout";
import logo from "../../assets/logo.png";
import { TicketsContext } from "../../context/Tickets/TicketsContext";

import { i18n } from "../../translate/i18n";

const Header = styled(Box)({
    // Estilos do header
});

const Content = styled(Box)({
    overflow: "auto"
});

const PlaceholderContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    backgroundColor: theme.palette.boxticket,
}));

const PlaceholderItem = styled('div')({
    // Estilos do placeholder item
});

const Logo = styled('img')({
    margin: "0 auto",
    width: "70%"
});

const TicketAdvanced = (props) => {
    const { ticketId } = useParams();
    const [option, setOption] = useState(0);
    const { currentTicket, setCurrentTicket } = useContext(TicketsContext);

    useEffect(() => {
        if(currentTicket.id !== null) {
            setCurrentTicket({ id: currentTicket.id, code: '#open' });
        }
        if (!ticketId) {
            setOption(1);
        }
        return () => {
            setCurrentTicket({ id: null, code: null });
        }
    }, []);

    useEffect(() => {
        if (currentTicket.id !== null) {
            setOption(0);
        }
    }, [currentTicket]);

    const renderPlaceholder = () => {
        return (
            <PlaceholderContainer>
                <PlaceholderItem>
                    <center><Logo src={logo} alt="logologin" /></center>
                </PlaceholderItem>
                <br />
                <Button 
                    onClick={() => setOption(1)} 
                    variant="contained" 
                    color="primary"
                >
                    Selecionar Ticket
                </Button>
            </PlaceholderContainer>
        );
    };

    const renderMessageContext = () => {
        if (ticketId) {
            return <Ticket />;
        }
        return renderPlaceholder();
    };

    const renderTicketsManagerTabs = () => {
        return <TicketsManagerTabs />;
    };

    return (
        <TicketAdvancedLayout>
            <Header>
                <BottomNavigation
                    value={option}
                    onChange={(event, newValue) => {
                        setOption(newValue);
                    }}
                    showLabels
                >
                    <BottomNavigationAction label="Ticket" icon={<ChatIcon />} />
                    <BottomNavigationAction label="Atendimentos" icon={<QuestionAnswerIcon />} />
                </BottomNavigation>
            </Header>
            <Content>
                {option === 0 ? renderMessageContext() : renderTicketsManagerTabs()}
            </Content>
        </TicketAdvancedLayout>
    );
};

export default TicketAdvanced;
