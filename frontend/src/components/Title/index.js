import React from "react";
import Typography from '@mui/material/Typography';

const Title = ({ children }) => {
	return (
		<Typography variant="h5" color="primary" gutterBottom>
			{children}
		</Typography>
	);
};

export default Title;
