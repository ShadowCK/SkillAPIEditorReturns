const path = require('path');

module.exports = {
  entry: './src/main.js',
  mode: 'development',
  watchOptions: {
    aggregateTimeout: 200,
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
};
