const LOAD = 'redux-example/auth/LOAD';
const LOAD_SUCCESS = 'redux-example/auth/LOAD_SUCCESS';
const LOAD_FAIL = 'redux-example/auth/LOAD_FAIL';
const LOGIN = 'redux-example/auth/LOGIN';
const LOGIN_SUCCESS = 'redux-example/auth/LOGIN_SUCCESS';
const LOGIN_FAIL = 'redux-example/auth/LOGIN_FAIL';
const LOGOUT = 'redux-example/auth/LOGOUT';
const LOGOUT_SUCCESS = 'redux-example/auth/LOGOUT_SUCCESS';
const LOGOUT_FAIL = 'redux-example/auth/LOGOUT_FAIL';
const REGISTER_SUCCESS = 'jzc/auth/REGISTER_SUCCESS';
const REGISTER_FAIL = 'jzc/auth/REGISTER_FAIL';
const REGISTER = 'jzc/auth/REGISTER';
const ALL_ADMIN = 'jzc/auth/ALL_ADMIN';
const ALL_ADMIN_SUCCESS = 'jzc/auth/ALL_ADMIN_SUCCESS';
const ALL_ADMIN_FAIL = 'jzc/auth/ALL_ADMIN_FAIL';

const initialState = {
  loaded: false
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        user: action.result
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case LOGIN:
      return {
        ...state,
        loggingIn: true
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        loggingIn: false,
        user: action.result.user
      };
    case LOGIN_FAIL:
      return {
        ...state,
        loggingIn: false,
        user: null,
        loginError: action.error
      };
    case LOGOUT:
      return {
        ...state,
        loggingOut: true
      };
    case LOGOUT_SUCCESS:
      return {
        ...state,
        loggingOut: false,
        user: null
      };
    case LOGOUT_FAIL:
      return {
        ...state,
        loggingOut: false,
        logoutError: action.error
      };
    case REGISTER:
      return {
        ...state,
        registering: true,
      };
    case REGISTER_SUCCESS:
      return {
        ...state,
        user: action.result.user
      };
    case REGISTER_FAIL:
      return {
        ...state,
        register: action.error
      };
    case ALL_ADMIN:
      return {
        ...state,
        allAdminGetting: true,
        addAdmin: []
      };
    case ALL_ADMIN_FAIL:
      return {
        ...state,
        allAdminError: action.error
      };
    case ALL_ADMIN_SUCCESS:
      return {
        ...state,
        allAdmin: action.result.allAdmin
      };
    default:
      return state;
  }
}

// login
export function isLoaded(globalState) {
  return globalState.auth && globalState.auth.loaded;
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get('admin/loadAuth')
  };
}

function _login({name, password}) {
  return {
    types: [LOGIN, LOGIN_SUCCESS, LOGIN_FAIL],
    promise: (client) => client.post('/admin/login', {
      data: {
        name,
        password
      }
    })
  };
}


export function login(data, callback) {
  return (dispatch) => {
    dispatch(_login(data))
      .then(callback);
  };
}

function _getAllAdmin() {
  return {
    types: [ALL_ADMIN, ALL_ADMIN_SUCCESS, ALL_ADMIN_FAIL],
    promise: (client) => client.get('/admin/all')
  };
}

export function getAllAdmin(callback) {
  return (dispatch) => {
    dispatch(_getAllAdmin())
      .then(callback);
  };
}

export function logout() {
  return {
    types: [LOGOUT, LOGOUT_SUCCESS, LOGOUT_FAIL],
    promise: (client) => client.get('/logout')
  };
}

// register
function _register({name, password, file}) {
  return {
    types: [REGISTER, REGISTER_SUCCESS, REGISTER_FAIL],
    promise: (client) => client.post('/admin/register', {
      data: {
        name,
        password,
        file
      }
    })
  };
}

export function register(data, callback) {
  return (dispatch) => {
    dispatch(_register(data))
      .then(callback);
  };
}
