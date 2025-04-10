import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

const TicketAdvancedLayout = styled(Paper)({
    height: `calc(100% - 48px)`,
    display: "grid",
    gridTemplateRows: "56px 1fr"
})

export default TicketAdvancedLayout;