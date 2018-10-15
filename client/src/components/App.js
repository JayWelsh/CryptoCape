import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import CryptocapeLogo from '../img/Cryptocape9.png';
import PageContainer from './PageContainer';
import NavigationItemsMain from './NavigationItems';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import ApolloClient from 'apollo-boost';
import gql from "graphql-tag";
import { ApolloProvider } from "react-apollo";

let endpointGraphQL = "https://cryptocape.com/graphql"
if (process.env.NODE_ENV !== 'production' || process.env.REACT_APP_FORCE_LOCALHOST) {
  endpointGraphQL = "http://localhost:5000/graphql"
}

const client = new ApolloClient({
  uri: endpointGraphQL
});

const drawerWidth = 210;
const sizeConsiderMobile = 600;

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  appFrame: {
    height: '100%',
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    width: '100%',
  },
  appBar: {
    position: 'fixed',
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    background: '#3f51b5',
    background: '-webkit-linear-gradient(-90deg, #3f51b5, #2d0056)',
    background: '-o-linear-gradient(-90deg, #3f51b5, #2d0056)',
    background: '-moz-linear-gradient(-90deg, #3f51b5, #2d0056)',
    background: 'linear-gradient(-90deg, #3f51b5, #2d0056)',
  },
  appBarShift: {
    // width: `calc(100% - ${drawerWidth}px)`,
    // transition: theme.transitions.create(['margin', 'width'], {
    //   easing: theme.transitions.easing.easeOut,
    //   duration: theme.transitions.duration.enteringScreen,
    // }),
  },
  'appBarShift-left': {
    
  },
  'appBarShift-right': {
    
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20,
  },
  hide: {
    display: 'none',
  },
  drawerPaper: {
    position: 'fixed',
    width: drawerWidth,
    zIndex: 1080,
  },
  drawerPaperPlaceholder: {
    position: 'relative',
    width: drawerWidth,
    zIndex: 1080,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  'content-left': {
    marginLeft: -drawerWidth,
  },
  'content-right': {
    marginRight: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  transitionWidth: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  'contentShift-left': {
    marginLeft: 0,
  },
  'contentShift-right': {
    marginRight: 0,
  },
});

let pageResizePreventDoubleFire;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.pageContainer = React.createRef();
    this.main = React.createRef();
  }

  state = {
    open: false,
    anchor: 'left',
    lastPageWidth: 0,
    lastDocumentWidth: 0
  };

  

  handleDrawerToggle = () => {
    this.setState({ open: !this.state.open }, function(){
    });
  };

  componentDidMount() {
    this.pageContainer.current.addEventListener("transitionend", this.handlePageResize);
    window.addEventListener("resize", this.handlePageResize);
    window.addEventListener("menuToggle", this.handleDrawerToggle);
  }

  componentWillUnmount() {
    this.pageContainer.current.removeEventListener("transitionend", this.handlePageResize);
  }

  handlePageResize = (event) => {
    let thisPersist = this;
    let pageWidth = thisPersist.main.current.offsetWidth;
    let documentWidth = window.width;
    if ((pageWidth !== this.state.lastPageWidth) || documentWidth !== thisPersist.state.lastDocumentWidth) {
      if (event.propertyName === "width" || event.type === "resize") {
        if (pageResizePreventDoubleFire) {
          clearTimeout(pageResizePreventDoubleFire);
        }
        pageResizePreventDoubleFire = setTimeout(function () {
          window.dispatchEvent(new Event('reRenderCharts'));
          thisPersist.setState({ open: thisPersist.state.open, lastPageWidth: pageWidth, lastDocumentWidth: documentWidth});
        }, 100);
      }
    }
  }

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  handleChangeAnchor = event => {
    this.setState({
      anchor: !this.state.anchor,
    });
  };

  render() {
    const { classes, theme } = this.props;
    const { anchor, open } = this.state;
    let isConsideredMobile = false;
    const documentBodyClientWidth = document.body.clientWidth;

    if ((documentBodyClientWidth <= sizeConsiderMobile)) {
      isConsideredMobile = true;
      if (anchor === "left") {
        this.setState({ anchor: "right" });
      }
    }

    let widthOverride = {
      width: "calc(100%)"
    }
    if (open && drawerWidth && (documentBodyClientWidth >= sizeConsiderMobile)) {
      widthOverride = {
        width: "calc(" + (documentBodyClientWidth - drawerWidth) + "px)"
      }
    }

    const drawer = (
      <div>
        <div
          className={classes.drawerPaperPlaceholder}>
        </div>
        <Drawer
          variant="persistent"
          anchor={anchor}
          open={open}
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <div className={classes.drawerHeader}>
          </div>
          <Divider />
          <NavigationItemsMain isConsideredMobile={isConsideredMobile}/>
        </Drawer>
      </div>
    );

    let before = null;
    let after = null;

    if (anchor === 'left') {
      before = drawer;
    } else {
      after = drawer;
    }

    const desktopToolbar = (
      <Toolbar disableGutters={true}>
        <IconButton
          color="inherit"
          aria-label="Open drawer"
          onClick={this.handleDrawerToggle}
          className={classNames(classes.menuButton) + " menu-button"}
        >
          <MenuIcon />
        </IconButton>
        <div className={"header-logo"}>
          <Link to={'/'} style={{ textDecoration: 'none' }}>
            <img className={"header-logo"} src={CryptocapeLogo} />
          </Link>
        </div>
      </Toolbar>
    );

    const mobileToolbar = (
      <Toolbar disableGutters={true}>
        <a className={"header-logo header-logo-mobile"} href="javascript:;">
          <Link to={'/'} style={{ textDecoration: 'none' }}>
            <img className={"header-logo"} src={CryptocapeLogo} />
          </Link>
        </a>
        <IconButton
          color="inherit"
          aria-label="Open drawer"
          onClick={this.handleDrawerToggle}
          className={classNames(classes.menuButton) + " menu-button"}
          style={{marginLeft: 'auto'}}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
    )

    const toolbar = isConsideredMobile ? mobileToolbar : desktopToolbar

    return (
      <Router>
        <ApolloProvider client={client}>
          <div className={classes.root}>
            <div className={classes.appFrame}>
              <AppBar
                className={classNames(classes.appBar, {
                  [classes.appBarShift]: open,
                  [classes[`appBarShift-${anchor}`]]: open,
                })}
              >
                {toolbar}
              </AppBar>
              {before}
              <main
                className={classNames(classes.content, classes[`content-${anchor}`], {
                  [classes.contentShift]: open,
                  [classes[`contentShift-${anchor}`]]: open,
                })}
                style={{ maxWidth: '100%' }}
                ref={this.main}
              >
                <div className={classes.drawerHeader} />
                <div ref={this.pageContainer} className={classNames({ [classes.pageWidth]: open }) + " " + classes.transitionWidth} style={widthOverride}>
                  <PageContainer isConsideredMobile={isConsideredMobile} />
                </div>
              </main>
              {after}
            </div>
          </div>
        </ApolloProvider>
      </Router>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(App);