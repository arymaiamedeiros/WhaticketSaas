import { styled } from '@mui/material/styles';
import { Box, Paper, TableCell, TableRow } from '@mui/material';

export const Root = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(3),
}));

export const MainPaper = styled(Paper)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  boxShadow: theme.shadows[1],
}));

export const Tooltip = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: theme.shadows[2],
  fontSize: theme.typography.body2.fontSize,
  padding: theme.spacing(1),
}));

export const TooltipPopper = styled('div')(({ theme }) => ({
  [`& .MuiTooltip-tooltip`]: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}));

export const ButtonProgress = styled('div')(({ theme }) => ({
  color: theme.palette.primary.main,
  position: 'absolute',
  top: '50%',
  left: '50%',
  marginTop: -12,
  marginLeft: -12,
}));

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1),
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
})); 
