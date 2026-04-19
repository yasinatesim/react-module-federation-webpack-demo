const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  devServer: {
    port: 3001,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  output: {
    publicPath: 'auto',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  resolve: { extensions: ['.js', '.jsx'] },
  plugins: [
    new HtmlWebpackPlugin({ template: './public/index.html' }),
    new ModuleFederationPlugin({
      name: 'products_app',
      filename: 'remoteEntry.js',
      exposes: {
        './ProductList': './src/ProductList',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
      },
    }),
  ],
};
