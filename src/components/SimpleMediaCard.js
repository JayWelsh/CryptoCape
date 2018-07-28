import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import placeholder1 from '../img/placeholder1.jpg';
import placeholder2 from '../img/placeholder2.jpg';
import placeholder3 from '../img/placeholder3.jpg';
import placeholder4 from '../img/placeholder4.png';
import placeholder5 from '../img/placeholder5.jpg';
import placeholder6 from '../img/placeholder6.jpg';
import placeholder7 from '../img/placeholder7.jpg';
import placeholder8 from '../img/placeholder8.jpg';
import placeholder9 from '../img/placeholder9.jpg';
import placeholder10 from '../img/placeholder10.jpg';
import placeholder11 from '../img/placeholder11.jpg';
import placeholder12 from '../img/placeholder12.jpg';
import placeholder13 from '../img/placeholder13.jpg';
import placeholder14 from '../img/placeholder14.jpg';

const styles = {
  card: {
    width: 345,
    display:'inline-block',
    left: '50%',
    position: 'relative',
    transform: 'translateX(-50%)'
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  cardPositioning: {
    display: 'inline-block',
    // margin:'10px 0 70px 2%',
    left: '50%',
    position: 'relative',
    transform: 'translateX(-50%)'
  }
};

class SimpleMediaCard extends React.Component {
state = {
  //TODO
};

handleChange = (event, value) => {
  this.setState({ value });
};

handleChangeIndex = index => {
  this.setState({ value: index });
};

render() {
  //TODO Props
  const { classes, theme } = this.props;

  function getImageName() {
    let number = Math.floor(Math.random() * 14) + 1;
    if (number == 1) {
      return placeholder1
    } else if (number == 2) {
      return placeholder2
    } else if (number == 3) {
      return placeholder3
    } else if (number == 4) {
      return placeholder4
    } else if (number == 5) {
      return placeholder5
    } else if (number == 6) {
      return placeholder6
    } else if (number == 7) {
      return placeholder7
    } else if (number == 8) {
      return placeholder8
    } else if (number == 9) {
      return placeholder9
    } else if (number == 10) {
      return placeholder10
    } else if (number == 11) {
      return placeholder11
    } else if (number == 12) {
      return placeholder12
    } else if (number == 13) {
      return placeholder13
    } else if (number == 14) {
      return placeholder14
    }
    
  }

  return (
    <div className={classes.cardPositioning}>
      <Card className={classes.card}>
        <CardMedia
          className={classes.media}
          image={getImageName()}
          title="Life or dream?"
        />
        <CardContent>
          <Typography gutterBottom variant="headline" component="h2">
            Lizard
          </Typography>
          <Typography component="p">
            Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging
            across all continents except Antarctica
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small" color="primary">
            Share
          </Button>
          <Button size="small" color="primary">
            Learn More
          </Button>
        </CardActions>
      </Card>
    </div>
  );
}
}

SimpleMediaCard.propTypes = {
classes: PropTypes.object.isRequired,
theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(SimpleMediaCard);
