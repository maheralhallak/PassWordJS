import * as serviceWorker    from './serviceWorker';

import React                 from 'react';
import ReactDOM              from 'react-dom';
import { BrowserRouter }     from 'react-router-dom';
import { Auth, authReducer } from './lib/auth'
import { Provider }          from 'react-redux'
import { createStore, combineReducers } from 'redux'

import App from './App';

const store = createStore(
  combineReducers({
    auth: authReducer
  })
);

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <Auth/>{/*This implements all the authentication logic*/}
      <App/>
    </BrowserRouter>
  </Provider>
  , document.getElementById('root'));

serviceWorker.register();