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
import PortfolioDonut from '@material-ui/icons/DonutSmall';
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
  const { classes, theme, isConsideredMobile } = props;
  let emitMenuToggleFunction = emitMenuToggleDisable;
  if(isConsideredMobile){
    emitMenuToggleFunction = emitMenuToggleEnable;
  }
  return (
    <div>
      <List>
        <Link to={'/'} style={{ textDecoration: 'none' }}>
          <ListItem onClick={emitMenuToggleFunction} button>
            <ListItemIcon>
              <Home />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
        </Link>
        <Link to={'/portfolio'} style={{ textDecoration: 'none' }}>
          <ListItem onClick={emitMenuToggleFunction} button>
            <ListItemIcon>
              <PortfolioDonut />
            </ListItemIcon>
            <ListItemText primary="Portfolio" />
          </ListItem>
        </Link>
        <Link to={'/charts'} style={{ textDecoration: 'none' }}>
          <ListItem onClick={emitMenuToggleFunction} button>
            <ListItemIcon>
              <Timeline />
            </ListItemIcon>
            <ListItemText primary="Charts" />
          </ListItem>
        </Link>
        <Link to={'/alerts'} style={{ textDecoration: 'none' }}>
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
        </Link>
      </List>
      <Divider />
      <List>
          <Link to={'/settings'} style={{ textDecoration: 'none' }}>
            <ListItem onClick={emitMenuToggleFunction} button>
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>
          </Link>
      </List>
    </div>
  );
}

NavigationItemsMain.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  isConsideredMobile: PropTypes.bool
};

export default withStyles(styles, { withTheme: true })(NavigationItemsMain);