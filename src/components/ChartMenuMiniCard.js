import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import AlertIcon from '@material-ui/icons/NotificationsActive';
import LaunchIcon from '@material-ui/icons/Launch';
import PerformanceIcon from '@material-ui/icons/Timeline';
import FavouriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import {Link} from 'react-router-dom';

const styles = theme => ({
    cardPositioning: {
        display: 'inline-block',
        // margin:'10px 0 70px 2%',
        left: '50%',
        position: 'relative',
        transform: 'translateX(-50%)'
    },
  card: {
    display: 'flex',
    width: '345px'
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: '1 0 auto',
    paddingBottom: '0px',
    paddingTop: '14px'
  },
  cover: {
    width: 151,
    height: 151,
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
  },
  alertIcon: {

  },
});

function ChartMenuMiniCard(props) {
  const { classes, theme, headline, subHeadline, image, externalLink, chartLink } = props;

  return (
    <div className={classes.cardPositioning}>
      <Card className={classes.card}>
      <Link to={`/charts/${chartLink}`}>
      <CardMedia
          className={classes.cover}
          image={image}
          title={subHeadline}
          style={{backgroundSize:"contain", backgroundOrigin: "content-box", padding: '5px'}}
        />
        </Link>
        <div className={classes.details}>
          <CardContent className={classes.content}>
          <Link to={`/charts/${chartLink}`} style={{ textDecoration: 'none' }}>
            <Typography variant="headline">{headline}</Typography>
            <Typography variant="subheading" color="textSecondary">
                {subHeadline}
            </Typography>
            </Link>
          </CardContent>
          <div className={classes.controls}>
            <a href={externalLink} target="_blank" rel="noopener noreferrer">
            <IconButton title="Official Site">
              <LaunchIcon />
            </IconButton>
            </a>
            <Link to={`/charts/${chartLink}`}>
            <IconButton title="Performance">
              <PerformanceIcon />
            </IconButton>
            </Link>
            <Link to={`/alerts/${chartLink}`}>
            <IconButton title="Alerts">
              <AlertIcon />
            </IconButton>
            </Link>
            <IconButton title="Favourite">
              <FavouriteBorderIcon />
            </IconButton>
          </div>
        </div>
        
      </Card>
    </div>
  );
}

ChartMenuMiniCard.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(ChartMenuMiniCard);