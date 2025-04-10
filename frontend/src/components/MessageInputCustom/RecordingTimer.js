import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";

const TimerBox = styled(Box)(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	margin: "0 10px",
}));

const RecordingTimer = () => {
	const [seconds, setSeconds] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setSeconds(prev => prev + 1);
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	const formatTime = time => {
		const minutes = Math.floor(time / 60);
		const seconds = time % 60;
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	};

	return (
		<TimerBox>
			<Typography variant="body2" color="textSecondary">
				{formatTime(seconds)}
			</Typography>
		</TimerBox>
	);
};

export default RecordingTimer;
