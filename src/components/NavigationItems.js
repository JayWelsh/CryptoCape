import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Timeline from '@material-ui/icons/Timeline';
import Home from '@material-ui/icons/Home';
import Settings from '@material-ui/icons/Settings';
import AccountCircle from '@material-ui/icons/AccountCircle';
import NotificationsActive from '@material-ui/icons/NotificationsActive';
import {Link} from 'react-router-dom';

export const mailFolderListItems = (
  <div>
    <Link to={'/'} style={{ textDecoration: 'none' }}>
      <ListItem button>
        <ListItemIcon>
          <Home />
        </ListItemIcon>
        <ListItemText primary="Home" />
      </ListItem>
    </Link>
    <Link to={'/charts'} style={{ textDecoration: 'none' }}>
      <ListItem button>
        <ListItemIcon>
          <Timeline />
        </ListItemIcon>
        <ListItemText primary="Charts" />
      </ListItem>
    </Link>
    <Link to={'/alerts'} style={{ textDecoration: 'none' }}>
      <ListItem button>
        <ListItemIcon>
          <NotificationsActive />
        </ListItemIcon>
        <ListItemText primary="Alerts" />
      </ListItem>
    </Link>
    <Link to={'/account'} style={{ textDecoration: 'none' }}>
      <ListItem button>
        <ListItemIcon>
          <AccountCircle />
        </ListItemIcon>
        <ListItemText primary="Account" />
      </ListItem>
    </Link>
  </div>
);

export const otherMailFolderListItems = (
  <div>
    <Link to={'/settings'} style={{ textDecoration: 'none' }}>
      <ListItem button>
        <ListItemIcon>
          <Settings />
        </ListItemIcon>
        <ListItemText primary="Settings" />
      </ListItem>
    </Link>
  </div>
);