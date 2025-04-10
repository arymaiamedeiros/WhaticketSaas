import React from "react";
import { styled } from "@mui/material/styles";
import { green } from "@mui/material/colors";
import { CircularProgress, Button } from "@mui/material";

const StyledButton = styled(Button)({
	position: "relative",
});

const StyledCircularProgress = styled(CircularProgress)({
	color: green[500],
	position: "absolute",
	top: "50%",
	left: "50%",
	marginTop: -12,
	marginLeft: -12,
});

const ButtonWithSpinner = ({ loading, children, ...rest }) => {
	return (
		<StyledButton disabled={loading} {...rest}>
			{children}
			{loading && (
				<StyledCircularProgress size={24} />
			)}
		</StyledButton>
	);
};

export default ButtonWithSpinner;
