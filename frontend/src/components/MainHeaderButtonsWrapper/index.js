import React from "react";
import { styled } from '@mui/material/styles';

const StyledWrapper = styled('div')(({ theme }) => ({
	flex: "none",
	marginLeft: "auto",
	"& > *": {
		margin: theme.spacing(1),
	},
}));

const MainHeaderButtonsWrapper = ({ children }) => {
	return <StyledWrapper>{children}</StyledWrapper>;
};

export default MainHeaderButtonsWrapper;
