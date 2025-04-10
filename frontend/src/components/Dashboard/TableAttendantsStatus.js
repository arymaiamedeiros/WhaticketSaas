import React from "react";
import { styled } from '@mui/material/styles';
import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Skeleton,
	Rating
} from '@mui/material';
import { green, red } from '@mui/material/colors';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import moment from 'moment';

const StyledCheckCircleIcon = styled(CheckCircleIcon)({
	color: green[600],
	fontSize: '20px'
});

const StyledErrorIcon = styled(ErrorIcon)({
	color: red[600],
	fontSize: '20px'
});

const StyledTableCell = styled(TableCell)({
	cursor: "pointer"
});

export function RatingBox({ rating }) {
	const ratingTrunc = rating === null ? 0 : Math.trunc(rating);
	return (
		<Rating
			defaultValue={ratingTrunc}
			max={3}
			readOnly
		/>
	);
}

export default function TableAttendantsStatus(props) {
	const { loading, attendants } = props;

	function renderList() {
		return attendants.map((a, k) => (
			<TableRow key={k}>
				<TableCell>{a.name}</TableCell>
				<StyledTableCell align="center" title="1 - Insatisfeito, 2 - Satisfeito, 3 - Muito Satisfeito">
					<RatingBox rating={a.rating} />
				</StyledTableCell>
				<TableCell align="center">{formatTime(a.avgSupportTime, 2)}</TableCell>
				<TableCell align="center">
					{a.online ? (
						<StyledCheckCircleIcon />
					) : (
						<StyledErrorIcon />
					)}
				</TableCell>
			</TableRow>
		));
	}

	function formatTime(minutes) {
		return moment().startOf('day').add(minutes, 'minutes').format('HH[h] mm[m]');
	}

	return !loading ? (
		<TableContainer component={Paper}>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>Nome</TableCell>
						<TableCell align="center">Avaliações</TableCell>
						<TableCell align="center">T.M. de Atendimento</TableCell>
						<TableCell align="center">Status (Atual)</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{renderList()}
				</TableBody>
			</Table>
		</TableContainer>
	) : (
		<Skeleton variant="rectangular" height={150} />
	);
}
