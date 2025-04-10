import React from "react";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import Tickets from "../TicketsCustom";
import TicketAdvanced from "../TicketsAdvanced";

function TicketResponsiveContainer() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  if (isDesktop) {
    return <Tickets />;
  }
  return <TicketAdvanced />;
}

export default TicketResponsiveContainer;
