import React from 'react';
import PropTypes from 'prop-types';
import App from './components/App';
import { withStyles } from '@material-ui/core/styles';
import withRoot from './withRoot';

const styles = theme => ({
  root: {
    textAlign: 'left',
  }
});

class Index extends React.Component {
  state = {
    open: false,
  };

  render() {
    const { classes, setDarkMode, isDarkMode } = this.props;
    const { open } = this.state;

    return (
      <div className={[classes.root, isDarkMode && "dark"].join(" ")}>
        <App setDarkMode={setDarkMode} isDarkMode={isDarkMode} className={styles.navigationMain}/>
      </div>
    );
  }
}

Index.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRoot(withStyles(styles)(Index));