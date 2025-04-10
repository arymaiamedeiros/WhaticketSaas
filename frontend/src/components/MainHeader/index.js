import React from "react";
import { styled } from '@mui/material/styles';

const StyledHeader = styled('div')({
	display: "flex",
	alignItems: "center",
	padding: "0px 6px 6px 6px",
});

const MainHeader = ({ children }) => {
	return <StyledHeader>{children}</StyledHeader>;
};

export default MainHeader;
