import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Timeline from '@material-ui/icons/Timeline';
import Home from '@material-ui/icons/Home';
import Settings from '@material-ui/icons/Settings';
import AccountCircle from '@material-ui/icons/AccountCircle';
import NotificationsActive from '@material-ui/icons/NotificationsActive';

export const mailFolderListItems = (
  <div>
    <ListItem button>
      <ListItemIcon>
        <Home />
      </ListItemIcon>
      <ListItemText primary="Home" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <Timeline />
      </ListItemIcon>
      <ListItemText primary="Charts" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <NotificationsActive />
      </ListItemIcon>
      <ListItemText primary="Alerts" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <AccountCircle />
      </ListItemIcon>
      <ListItemText primary="Account" />
    </ListItem>
  </div>
);

export const otherMailFolderListItems = (
  <div>
    <ListItem button>
      <ListItemIcon>
        <Settings />
      </ListItemIcon>
      <ListItemText primary="Settings" />
    </ListItem>
  </div>
);