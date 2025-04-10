import React from "react";
import { styled } from "@mui/material/styles";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography
} from "@mui/material";
import { i18n } from "../../translate/i18n";

const StyledDialog = styled(Dialog)(({ theme }) => ({
	"& .MuiDialog-paper": {
		minWidth: 400,
		[theme.breakpoints.down("sm")]: {
			minWidth: "auto"
		}
	}
}));

const StyledButton = styled(Button)(({ theme }) => ({
	margin: theme.spacing(1)
}));

const ConfirmationModal = ({ title, children, open, onClose, onConfirm }) => {
	return (
		<StyledDialog
			open={open}
			onClose={() => onClose(false)}
			aria-labelledby="confirm-dialog"
		>
			<DialogTitle id="confirm-dialog">{title}</DialogTitle>
			<DialogContent dividers>
				<Typography>{children}</Typography>
			</DialogContent>
			<DialogActions>
				<StyledButton
					variant="contained"
					onClick={() => onClose(false)}
					color="inherit"
				>
					{i18n.t("confirmationModal.buttons.cancel")}
				</StyledButton>
				<StyledButton
					variant="contained"
					onClick={() => {
						onClose(false);
						onConfirm();
					}}
					color="secondary"
				>
					{i18n.t("confirmationModal.buttons.confirm")}
				</StyledButton>
			</DialogActions>
		</StyledDialog>
	);
};

export default ConfirmationModal;
