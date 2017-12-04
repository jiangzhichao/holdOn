import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { reducer as reduxAsyncConnect } from 'redux-async-connect';
import auth from './auth';

export default combineReducers({
  routing,
  reduxAsyncConnect,
  auth,
});
