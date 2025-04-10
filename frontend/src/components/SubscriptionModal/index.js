import React, { useEffect, useRef } from "react";
import { styled } from '@mui/material/styles';
import { green } from '@mui/material/colors';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import CheckoutPage from "../CheckoutPage/";

const Root = styled('div')({
    display: "flex",
    flexWrap: "wrap",
});

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        maxWidth: 'md',
    },
}));

const SubscriptionModal = ({ open, onClose, Invoice, contactId, initialValues, onSave }) => {
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const handleClose = () => {
        onClose();
    };

    return (
        <Root>
            <StyledDialog open={open} onClose={handleClose} scroll="paper">
                <DialogContent dividers>
                    <CheckoutPage Invoice={Invoice} />
                </DialogContent>
            </StyledDialog>
        </Root>
    );
};

export default SubscriptionModal;
