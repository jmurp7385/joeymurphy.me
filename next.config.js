const withTM = require('next-transpile-modules')(['@iconify/react', '@iconify-icons/cib']); // pass the modules you would like to see transpiled

module.exports = withTM();