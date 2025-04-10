import React from "react";
import { styled } from "@mui/material/styles";
import { Avatar, Card, CardHeader, Skeleton } from "@mui/material";

const StyledCard = styled(Card)(({ theme }) => ({
	display: "flex",
	backgroundColor: "#eee",
	flex: "none",
	borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
}));

const TicketHeaderSkeleton = () => {
	return (
		<StyledCard square>
			<CardHeader
				titleTypographyProps={{ noWrap: true }}
				subheaderTypographyProps={{ noWrap: true }}
				avatar={
					<Skeleton animation="wave" variant="circular">
						<Avatar alt="contact_image" />
					</Skeleton>
				}
				title={<Skeleton animation="wave" width={80} />}
				subheader={<Skeleton animation="wave" width={140} />}
			/>
		</StyledCard>
	);
};

export default TicketHeaderSkeleton;
