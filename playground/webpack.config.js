const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './main.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'main.js',
    libraryTarget: "var",
    library: "playground"
  },
  plugins: [
    // Copy our app's index.html to the build folder.
    new CopyWebpackPlugin([
      { from: './index.html', to: "index.html" }
    ])
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
          plugins: ['transform-runtime']
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader','css-loader']
      },
      {
        test: /\.(png|jpg|gif|svg|woff2?|eot|ttf|otf)$/,
        loader: 'url-loader',
        options: {
          name: 'assets/[name].[ext]?[hash]'
        }
      }
    ]
  }
}
