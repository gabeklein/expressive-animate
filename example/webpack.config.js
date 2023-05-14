module.exports = {
  mode: "development",
  entry: {
    index: "./src/index.js"
  },
  output: {
    path: __dirname + "/public",
    publicPath: "/",
    devtoolModuleFilenameTemplate: 'file:///[absolute-resource-path]'
  },
  devtool: "source-map",
  devServer: {
    host: "0.0.0.0",
    port: 3000,
    historyApiFallback: true,
    hot: true
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
    modules: ['../node_modules', './node_modules']
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)x?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              "@babel/preset-typescript",
              "@expressive/babel-preset-react"
            ]
          }
        }
      }
    ]
  }
};