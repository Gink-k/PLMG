const path = require("path");
require('babel-polyfill');

module.exports = {
  entry: {
      account: ["babel-polyfill", "./src/account.jsx"],
      comments: "./src/comments.jsx",
      search: "./src/search.jsx",
  },
  output: {
    path: path.join(__dirname, "/dist"),
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        },
      },
    ]
  }
}
