const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/public/client.js',        // Điểm vào cho Webpack (client.js)
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'client.bundle.js'          // File JS sau khi bundle
  },
  module: {
    rules: [
      {
        test: /\.css$/,                   // Load các file CSS
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.js$/,                    // Load các file JS
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/public/index.html', // File HTML gốc
      filename: 'index.html'               // Copy vào thư mục dist
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/public/assets', to: 'assets' }  // Copy thư mục assets vào dist
      ]
    })
  ],
  mode: 'production'
};
