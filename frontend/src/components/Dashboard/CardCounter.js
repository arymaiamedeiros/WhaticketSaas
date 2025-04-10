import React from "react";
import { styled } from '@mui/material/styles';
import { Avatar, Card, CardHeader, Typography } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import { grey } from '@mui/material/colors';

const StyledAvatar = styled(Avatar)(({ theme }) => ({
	fontSize: '55px',
	color: grey[500],
	backgroundColor: '#ffffff',
	width: theme.spacing(7),
	height: theme.spacing(7)
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
	fontSize: '18px',
	color: theme.palette.text.primary
}));

const StyledSubtitle = styled(Typography)(({ theme }) => ({
	color: grey[600],
	fontSize: '14px'
}));

export default function CardCounter(props) {
	const { icon, title, value, loading } = props;

	return !loading ? (
		<Card>
			<CardHeader
				avatar={
					<StyledAvatar>
						{icon}
					</StyledAvatar>
				}
				title={
					<StyledTitle variant="h6" component="h2">
						{title}
					</StyledTitle>
				}
				subheader={
					<StyledSubtitle variant="subtitle1" component="p">
						{value}
					</StyledSubtitle>
				}
			/>
		</Card>
	) : (
		<Skeleton variant="rectangular" height={80} />
	);
}
