// require('babel-polyfill');
const environment = {
  development: {
    isProduction: false
  },
  production: {
    isProduction: true
  }
}[process.env.NODE_ENV || 'development'];

module.exports = Object.assign({
  host: process.env.HOST || 'localhost',
  port: process.env.PORT,
  apiHost: process.env.APIHOST || 'localhost',
  apiPort: process.env.APIPORT,
  app: {
    title: 'Jzc Chat',
    description: 'study day day up',
    head: {
      titleTemplate: 'Jzc: %s',
      meta: [
        {name: 'description', content: 'Jzc Best'},
        {charset: 'utf-8'},
        {property: 'og:site_name', content: 'jzc'},
        {property: 'og:image', content: 'https://react-redux.herokuapp.com/logo.jpg'},
        {property: 'og:locale', content: 'en_US'},
        {property: 'og:title', content: 'jzc'},
        {property: 'og:description', content: 'jzc'},
        {property: 'og:card', content: 'jzc'},
        {property: 'og:site', content: '@jzc'},
        {property: 'og:creator', content: '@jzc'},
        {property: 'og:image:width', content: '200'},
        {property: 'og:image:height', content: '200'}
      ]
    }
  },

}, environment);
