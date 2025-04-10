import React from "react";
import { styled } from "@mui/material/styles";
import {
	Skeleton,
	Typography,
	Paper,
	Grid,
} from "@mui/material";
import { i18n } from "../../translate/i18n";

const Content = styled("div")(({ theme }) => ({
	padding: theme.spacing(2),
}));

const ContactHeader = styled(Paper)(({ theme }) => ({
	padding: theme.spacing(2),
	marginBottom: theme.spacing(2),
}));

const ContactAvatar = styled(Skeleton)(({ theme }) => ({
	marginRight: theme.spacing(2),
}));

const ContactDetails = styled(Paper)(({ theme }) => ({
	padding: theme.spacing(2),
}));

const ContactExtraInfo = styled(Paper)(({ theme }) => ({
	padding: theme.spacing(2),
	marginBottom: theme.spacing(1),
	display: "flex",
	flexDirection: "column",
	gap: theme.spacing(1),
}));

const ContactDrawerSkeleton = () => {
	return (
		<Content>
			<ContactHeader variant="outlined">
				<Grid container>
					<Grid item>
						<ContactAvatar
							animation="wave"
							variant="circular"
							width={60}
							height={60}
						/>
					</Grid>
					<Grid item>
						<Skeleton animation="wave" height={25} width={90} />
						<Skeleton animation="wave" height={25} width={80} />
						<Skeleton animation="wave" height={25} width={80} />
					</Grid>
				</Grid>
			</ContactHeader>
			<ContactDetails>
				<Typography variant="subtitle1">
					{i18n.t("contactDrawer.extraInfo")}
				</Typography>
				<ContactExtraInfo variant="outlined">
					<Skeleton animation="wave" height={20} width={60} />
					<Skeleton animation="wave" height={20} width={160} />
				</ContactExtraInfo>
				<ContactExtraInfo variant="outlined">
					<Skeleton animation="wave" height={20} width={60} />
					<Skeleton animation="wave" height={20} width={160} />
				</ContactExtraInfo>
				<ContactExtraInfo variant="outlined">
					<Skeleton animation="wave" height={20} width={60} />
					<Skeleton animation="wave" height={20} width={160} />
				</ContactExtraInfo>
			</ContactDetails>
		</Content>
	);
};

export default ContactDrawerSkeleton;
