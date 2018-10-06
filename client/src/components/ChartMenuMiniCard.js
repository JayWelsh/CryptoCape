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
import CardActionArea from '@material-ui/core/CardActionArea';
import {Link} from 'react-router-dom';

const styles = theme => ({
    cardPositioning: {
        display: 'inline-block',
        // margin:'10px 0 70px 2%',
        left: '50%',
        position: 'relative',
        transform: 'translateX(-50%)'
    },
    realtimeValue: {
      display: 'inline-block',
      right: '20px',
      top: '19px',
      position: 'absolute',
      float: 'right'
    },
    headline: {
      display: 'inline-block'
    },
  card: {
    display: 'flex',
    width: '345px',
    paddingLeft: '10px',
    paddingRight: '10px'
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
    paddingRight: '10px',
    position: 'absolute',
    zIndex: 5,
    paddingBottom: theme.spacing.unit,
    right: '0px',
    transform: 'translateY(-100%)',
    top:'100%'
  },
  alertIcon: {

  },
  iconMargin: {
    marginRight: '10px'
  }
});

function ChartMenuMiniCard(props) {
  const { classes, theme, headline, subHeadline, image, externalLink, chartLink, isPlaceholding, realtimeValue } = props;
  let disablePointerEventsIfPlaceholding;
  if(isPlaceholding){
    disablePointerEventsIfPlaceholding = 'disable-pointer-events';
  }
  return (
    <div className={classes.cardPositioning}>
      <div className={classes.controls}>
        <a href={externalLink} target="_blank" rel="noopener noreferrer" className={classes.iconMargin + " " + disablePointerEventsIfPlaceholding}>
          <IconButton title="Official Site">
            <LaunchIcon />
          </IconButton>
        </a>
        <Link to={`/charts/${chartLink}`} className={classes.iconMargin + " " + disablePointerEventsIfPlaceholding}>
          <IconButton title="Performance">
            <PerformanceIcon />
          </IconButton>
        </Link>
        <Link to={`/alerts/${chartLink}`} className={disablePointerEventsIfPlaceholding}>
          <IconButton title="Alerts">
            <AlertIcon />
          </IconButton>
        </Link>
        {/* <IconButton title="Favourite">
              <FavouriteBorderIcon />
            </IconButton> */}
      </div>
      <CardActionArea>
        <Link to={`/charts/${chartLink}`} style={{ textDecoration: 'none' }} className={disablePointerEventsIfPlaceholding}>
          <Card className={classes.card}>
            <CardMedia
              className={classes.cover}
              image={image}
              title={subHeadline}
              style={{ backgroundSize: "contain", backgroundOrigin: "content-box", padding: '5px' }}
            />
            <div className={classes.details}>
              <CardContent className={classes.content} style={{ paddingLeft: '24px' }}>
                  <Typography variant="headline" className={classes.headline}>
                    {headline}
                  </Typography>
                  <Typography variant="subheading" className={classes.realtimeValue}>{realtimeValue}</Typography>
                  <Typography variant="subheading" color="textSecondary">
                    {subHeadline}
                  </Typography>
              </CardContent>
            </div>
          </Card>
        </Link>
      </CardActionArea>
    </div>
  );
}

ChartMenuMiniCard.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(ChartMenuMiniCard);