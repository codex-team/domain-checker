const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './src/js/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [ '@babel/preset-env' ]
          }
        }
      },
      {
        test: /\.pcss$/,
        exclude: /node_modules/,
        use: ['style-loader', 'postcss-loader']
      }
    ]
  },
  plugins: [
    new Dotenv()
  ]
};
