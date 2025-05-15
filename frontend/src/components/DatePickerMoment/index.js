import React, { useState } from 'react';

import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { Box, TextField } from '@mui/material';

export const DatePickerMoment = ({ label, getDate }) => {
  const [selectedDate, setDate] = useState(null);

  const onDateChange = (date) => {
    getDate(moment(date).format('YYYY-MM-DD'));
    setDate(date);
  };

  return (
    <Box>
      <div
        style={{
          display: 'flex',
          alignSelf: 'center',
          justifyContent: 'center',
          borderRadius: 5,
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: '#c1c1c1',
          maxWidth: 170,
          marginBottom: 15,
          alignItems: 'center',
          paddingInline: 5,
        }}
      >
        <label htmlFor='datePicker-input'>{label}</label>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <DatePicker
            value={selectedDate}
            onChange={onDateChange}
            format="DD/MM/YYYY"
            slotProps={{
              textField: {
                id: 'datePicker-input',
                size: 'small',
                style: { padding: 2 }
              }
            }}
          />
        </LocalizationProvider>
      </div>
    </Box>
  );
};
