import React, { useState } from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import purple from '@material-ui/core/colors/purple';
import green from '@material-ui/core/colors/green';
import CssBaseline from '@material-ui/core/CssBaseline';

function withRoot(Component) {
  const WithRoot = (props) => {
    const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("darkMode") === "true");

    const setDarkMode = (setting) => {
      setIsDarkMode(setting);
      localStorage.setItem("darkMode", setting);
    }

    // A theme with custom primary and secondary color.
    // It's optional.
    const theme = createMuiTheme({
      breakpoints: {
        values: {
          xs: 785,
          sm: 785,
          md: 1150,
          lg: 1500,
          xl: 1440,
        },
      },
      palette: {
        primary: {
          light: isDarkMode ? purple[100] : purple[300],
          main: isDarkMode ? purple[300] : purple[500],
          dark: isDarkMode ? purple[500] : purple[700],
        },
        secondary: {
          light: isDarkMode ? "#1d1d1d" : "#d5d5d5",
          main: isDarkMode ? "#1d1d1d" : "#e0e0e0",
          dark: isDarkMode ? "#1d1d1d" : "#d5d5d5",
        },
        overrides: {
          MuiOutlinedInput: {
            root: {
              '&$focused $notchedOutline': {
                borderColor: 'green',
                borderWidth: 1,
              },
              '&:hover:not($disabled):not($focused):not($error) $notchedOutline': {
                borderColor: 'green',
                borderWidth: 1,
              },
            }
          },
        },
        ...(isDarkMode && {
          type: 'dark',
          background: {
            default: "#00020e",
            paper: "#1d1d1d"
          },
          text: {
            primary: "#FFFFFF"
          }
        })
      },
    });
    // MuiThemeProvider makes the theme available down the React tree
    // thanks to React context.
    return (
      <MuiThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <Component {...props} setDarkMode={setDarkMode} isDarkMode={isDarkMode}/>
      </MuiThemeProvider>
    );
  }

  return WithRoot;
}

export default withRoot;