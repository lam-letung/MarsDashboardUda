const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack'); // Chỉnh sửa cách import

module.exports = {
  entry: './src/public/client.js', // Điểm vào cho Webpack (client.js)
  output: {
    path: path.resolve(__dirname, 'dist'), // Thư mục đầu ra
    filename: 'client.bundle.js' // File JS sau khi bundle
  },
  
  module: {
    rules: [
      {
        test: /\.css$/, // Load các file CSS
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.js$/, // Load các file JS
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/public/index.html', // File HTML gốc
      filename: 'index.html' // Copy vào thư mục dist
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/public/assets', to: 'assets' } // Copy thư mục assets vào dist
      ]
    }),
    new webpack.DefinePlugin({
      'process.env.API_DOMAIN': JSON.stringify(process.env.API_DOMAIN), // Định nghĩa biến môi trường
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
    })
  ],
  mode: 'production' // Chế độ build
};
