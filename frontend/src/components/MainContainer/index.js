import React from "react";
import { styled } from '@mui/material/styles';
import Container from '@mui/material/Container';

const StyledContainer = styled(Container)(({ theme }) => ({
	flex: 1,
	padding: theme.spacing(2),
	height: `calc(100% - 48px)`,
}));

const ContentWrapper = styled('div')({
	height: "100%",
	overflowY: "hidden",
	display: "flex",
	flexDirection: "column",
});

const MainContainer = ({ children }) => {
	return (
		<StyledContainer>
			<ContentWrapper>{children}</ContentWrapper>
		</StyledContainer>
	);
};

export default MainContainer;
