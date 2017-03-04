/**
 * Bootstrap configuration for bootstrap-sass-loader
 *
 * Scripts are disabled to not load jQuery.
 * If you depend on Bootstrap scripts consider react-bootstrap instead.
 * https://github.com/react-bootstrap/react-bootstrap
 *
 * In order to keep the bundle size low in production
 * disable components you don't use.
 *
 */

module.exports = {
  preBootstrapCustomizations: './src/theme/variables.scss',
  mainSass: './src/theme/bootstrap.overrides.scss',
  verbose: false,
  debug: false,
  scripts: {
    transition: false,
    alert: false,
    button: false,
    carousel: false,
    collapse: false,
    dropdown: false,
    modal: false,
    tooltip: false,
    popover: false,
    scrollspy: false,
    tab: false,
    affix: false
  },
  styles: {
    mixins: false,
    normalize: false,
    print: false,
    glyphicons: false,
    scaffolding: false,
    type: false,
    code: false,
    grid: false,
    tables: false,
    forms: false,
    buttons: false,
    'component-animations': false,
    dropdowns: false,
    'button-groups': false,
    'input-groups': false,
    navs: false,
    navbar: false,
    breadcrumbs: false,
    pagination: false,
    pager: false,
    labels: false,
    badges: false,
    jumbotron: false,
    thumbnails: false,
    alerts: false,
    'progress-bars': false,
    media: false,
    'list-group': false,
    panels: false,
    wells: false,
    'responsive-embed': false,
    close: false,
    modals: false,
    tooltip: false,
    popovers: false,
    carousel: false,
    utilities: false,
    'responsive-utilities': false
  }
};
