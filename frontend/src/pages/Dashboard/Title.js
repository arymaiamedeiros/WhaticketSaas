import React from "react";
import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";

const StyledTypography = styled(Typography)(({ theme }) => ({
	marginBottom: theme.spacing(2)
}));

const Title = ({ children }) => {
	return (
		<StyledTypography component="h2" variant="h6" color="primary">
			{children}
		</StyledTypography>
	);
};

export default Title;
