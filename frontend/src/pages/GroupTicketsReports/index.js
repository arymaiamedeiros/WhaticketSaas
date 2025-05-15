import React, { useState, useEffect, useContext } from "react";
import moment from "moment";
import { validateAndFormatDate } from "../../utils/dateValidation";

const [ticketId, setTicketId] = useState('')
const [userIds, setUserIds] = useState([]);
const [dateFrom, setDateFrom] = useState(
  validateAndFormatDate(moment("1", "D").format("YYYY-MM-DD"))
);
const [dateTo, setDateTo] = useState(
  validateAndFormatDate(moment().format("YYYY-MM-DD"))
);

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  id="date-from"
                  label="Data Início"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(validateAndFormatDate(e.target.value))}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  id="date-to"
                  label="Data Fim"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(validateAndFormatDate(e.target.value))}
                  InputLabelProps={{
                    shrink: true,
                  }}
                /> 