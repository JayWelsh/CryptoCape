import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
//import registerServiceWorker from './registerServiceWorker';
import { unregister } from './registerServiceWorker';
import ReactGA from 'react-ga';

//Google Analytics
//Block with uBlock Origin if need be
//This helps me get a rough estimate of site activity to help with scaling
ReactGA.initialize('UA-128345594-1');
ReactGA.pageview(window.location.pathname + window.location.search);

ReactDOM.render(<App />, document.getElementById('root'));
unregister();
