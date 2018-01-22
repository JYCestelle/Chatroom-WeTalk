import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, hashHistory, IndexRoute} from 'react-router';
import {SignUpForm} from './SignUp';
import {SignInForm} from './SignIn';
import Channel from './singleChannel';
import Page from './ChannelPage';
import App from './App';
import firebase from 'firebase';


// Initialize Firebase
var config = {
    apiKey: "AIzaSyCvBoxME7l9yn4TybT7KEVU_mav9kWn6gA",
    authDomain: "chat-room-challenge.firebaseapp.com",
    databaseURL: "https://chat-room-challenge.firebaseio.com",
    storageBucket: "chat-room-challenge.appspot.com",
    messagingSenderId: "326524106582"
};
firebase.initializeApp(config);

//can load other CSS files (e.g,. Bootstrap) here

import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import 'react-mdl/extra/material.css';
import 'react-mdl/extra/material.js';
//load our CSS file
import './index.css';


//render the Application view
// ReactDOM.render(
//   <App />,
//   document.getElementById('root')
// );

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={SignInForm} />
      <Route path="login" component={SignInForm} />
      <Route path="join" component={SignUpForm} />
      <Route path="channels" component={Page} />   
      <Route path="channel" component={Channel}>
        <Route path=":channelName" component={Channel} /> 
      </Route>   
    </Route>  
  </Router>,
  document.getElementById('root')
);