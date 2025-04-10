import React from "react";
import { styled } from "@mui/material/styles";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

const StyledBackdrop = styled(Backdrop)(({ theme }) => ({
	zIndex: theme.zIndex.drawer + 1,
	color: "#fff",
}));

const BackdropLoading = () => {
	return (
		<StyledBackdrop open={true}>
			<CircularProgress color="inherit" />
		</StyledBackdrop>
	);
};

export default BackdropLoading;
