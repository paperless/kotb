const path = require('path');

const HtmlWebPackPlugin = require('html-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const devMode = process.env.NODE_ENV !== 'production';

const htmlPlugin = new HtmlWebPackPlugin({
  template: './src/index.html',
  filename: 'index.html',
});

const miniCssExtractPlugin = new MiniCssExtractPlugin({
  filename: devMode ? '[name].css' : '[name].[hash].css',
  chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
});

const terserPlugin = new TerserPlugin({
  parallel: true,
});

module.exports = {
  watch: devMode,
  mode: process.env.NODE_ENV,
  entry: { main: [
    './src/index.js',
  ] },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: devMode ? 'main.js' : 'main.[hash].js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [
    miniCssExtractPlugin,
    new ManifestPlugin(),
    htmlPlugin,
  ],
  optimization: {
    minimizer: !devMode ? [
      terserPlugin,
      new OptimizeCSSAssetsPlugin({}),
    ] : [],
  },
};
