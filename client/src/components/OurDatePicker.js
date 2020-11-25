import React from 'react';
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core";
import deepPurple from "@material-ui/core/colors/deepPurple";
import { DatePicker, MuiPickersUtilsProvider } from "material-ui-pickers";
import DateFnsUtils from "@date-io/date-fns";

const materialTheme = createMuiTheme({
    overrides: {
      MuiPickersToolbar: {
        toolbar: {
          backgroundColor: deepPurple.A200,
        },
      },
      MuiPickersCalendarHeader: {
        switchHeader: {
          // backgroundColor: lightBlue.A200,
          // color: "white",
        },
      },
      MuiPickersDay: {
        day: {
          color: deepPurple.A700,
        },
        daySelected: {
          backgroundColor: deepPurple["400"],
        },
        dayDisabled: {
          color: deepPurple["100"],
        },
        current: {
          color: deepPurple["900"],
        },
      },
      MuiPickersModal: {
        dialogAction: {
          color: deepPurple["400"],
        },
      },
    },
  });

const OurDatePicker = props => (
    <MuiThemeProvider theme={materialTheme}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DatePicker
                {...props}
            />
        </MuiPickersUtilsProvider>
    </MuiThemeProvider>
)

export default OurDatePicker;