import React from "react";
import { styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer
} from "recharts";

const PREFIX = "Chart";

const classes = {
	chartContainer: `${PREFIX}-chartContainer`,
};

const Root = styled("div")(({ theme }) => ({
	[`& .${classes.chartContainer}`]: {
		height: 300,
	},
}));

const Chart = ({ data }) => {
	const chartData = React.useMemo(() => {
		return data.tickets.map((ticket) => ({
			name: new Date(ticket.date).toLocaleDateString(),
			tickets: ticket.count,
		}));
	}, [data.tickets]);

	return (
		<Root>
			<Typography component="h2" variant="h6" color="primary" gutterBottom>
				Tickets por dia
			</Typography>
			<Box className={classes.chartContainer}>
				<ResponsiveContainer>
					<LineChart
						data={chartData}
						margin={{
							top: 16,
							right: 16,
							bottom: 0,
							left: 24,
						}}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="name" />
						<YAxis />
						<Tooltip />
						<Legend />
						<Line
							type="monotone"
							dataKey="tickets"
							stroke="#8884d8"
							activeDot={{ r: 8 }}
						/>
					</LineChart>
				</ResponsiveContainer>
			</Box>
		</Root>
	);
};

export default Chart;
