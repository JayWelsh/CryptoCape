import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import Timeline from '@material-ui/icons/Timeline';
import Home from '@material-ui/icons/Home';
import Settings from '@material-ui/icons/Settings';
import AccountCircle from '@material-ui/icons/AccountCircle';
import NotificationsActive from '@material-ui/icons/NotificationsActive';
import DarkModeIcon from '@material-ui/icons/NightsStay';
import LightModeIcon from '@material-ui/icons/WbSunny';
import PortfolioDonut from '@material-ui/icons/DonutSmall';
import GitHubLogo from '../img/GitHubLogo.svg';
import GitHubLogoDark from '../img/GitHubLogoDark.svg';
import DiscordLogo from '../img/DiscordLogo.svg';
import DiscordLogoDark from '../img/DiscordLogoDark.svg';
import {Link} from 'react-router-dom';

const styles = theme => ({
});

function emitMenuToggleEnable() {
  window.dispatchEvent(new Event('menuToggle'));
}

function emitMenuToggleDisable() {
  return true;
}

function NavigationItemsMain(props) {
  const { classes, theme, isConsideredMobile, isDarkMode, setDarkMode } = props;
  let emitMenuToggleFunction = emitMenuToggleDisable;
  if(isConsideredMobile){
    emitMenuToggleFunction = emitMenuToggleEnable;
  }
  return (
    <div>
      <List style={{paddingTop: '0px'}}>
        {/* <Link to={'/'} style={{ textDecoration: 'none' }}>
          <ListItem onClick={emitMenuToggleFunction} button>
            <ListItemIcon>
              <Home />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
        </Link> */}
        <Link to={'/portfolio'} style={{ textDecoration: 'none' }}>
          <ListItem onClick={emitMenuToggleFunction} button>
            <ListItemIcon>
              <PortfolioDonut />
            </ListItemIcon>
            <ListItemText primary="Portfolio" />
          </ListItem>
        </Link>
        <a href={"https://github.com/JayWelsh/CryptoCape"} style={{ textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
          <ListItem onClick={emitMenuToggleFunction} button>
            <ListItemIcon>
              {isDarkMode ? <img style={{padding: 1}} width={'24px'} src={GitHubLogo}/> : <img style={{padding: 1}} width={'24px'} src={GitHubLogoDark}/>}
            </ListItemIcon>
            <ListItemText primary="GitHub" />
          </ListItem>
        </a>
        <a href={"https://discord.gg/x6T427nAH7"} style={{ textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
          <ListItem onClick={emitMenuToggleFunction} button>
            <ListItemIcon>
              {isDarkMode ? <img style={{padding: 1}} width={'24px'} src={DiscordLogo}/> : <img style={{padding: 1}} width={'24px'} src={DiscordLogoDark}/>}
            </ListItemIcon>
            <ListItemText primary="Discord" />
          </ListItem>
        </a>
        <ListItem onClick={() => {
          setDarkMode(!isDarkMode);
        }} button>
            <ListItemIcon>
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon/>}
            </ListItemIcon>
            <ListItemText primary={isDarkMode ? "Light Mode" : "Dark Mode"} />
        </ListItem>
        {/* <Link to={'/alerts'} style={{ textDecoration: 'none' }}>
          <ListItem onClick={emitMenuToggleFunction} button>
            <ListItemIcon>
              <NotificationsActive />
            </ListItemIcon>
            <ListItemText primary="Alerts" />
          </ListItem>
        </Link>
        <Link to={'/account'} style={{ textDecoration: 'none' }}>
          <ListItem onClick={emitMenuToggleFunction} button>
            <ListItemIcon>
              <AccountCircle />
            </ListItemIcon>
            <ListItemText primary="Account" />
          </ListItem>
        </Link> */}
      </List> 
      {/* <Divider />
      <List>
          <Link to={'/settings'} style={{ textDecoration: 'none' }}>
            <ListItem onClick={emitMenuToggleFunction} button>
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>
          </Link>
      </List> */}
    </div>
  );
}

NavigationItemsMain.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  isConsideredMobile: PropTypes.bool
};

export default withStyles(styles, { withTheme: true })(NavigationItemsMain);