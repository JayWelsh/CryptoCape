import React from 'react';
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core";
import deepPurple from "@material-ui/core/colors/deepPurple";
import purple from '@material-ui/core/colors/purple';
import pink from '@material-ui/core/colors/pink';
import { DatePicker, MuiPickersUtilsProvider } from "material-ui-pickers";
import DateFnsUtils from "@date-io/date-fns";

const OurDatePicker = props => {
  const materialTheme = createMuiTheme({
    palette:{
      ...(props.isDarkMode && {
        type: 'dark',
        primary: {
          light: purple[100],
          main: purple[300],
          dark: purple[500],
        }
      }),
    },
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
          color: props.isDarkMode ? purple[300] : deepPurple.A700,
        },
        daySelected: {
          backgroundColor: deepPurple["400"],
        },
        dayDisabled: {
          color: deepPurple["100"],
        },
        current: {
          color: props.isDarkMode ? pink[500] : deepPurple["900"],
        },
      },
      MuiPickersModal: {
        dialogAction: {
          color: props.isDarkMode ? purple[100] : deepPurple["400"],
        },
      },
    },
  });
  return (
    <MuiThemeProvider theme={materialTheme}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DatePicker
                {...props}
            />
        </MuiPickersUtilsProvider>
    </MuiThemeProvider>
  )
}

export default OurDatePicker;