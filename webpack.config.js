module.exports = {
  node: {
    path: true,
    crypto: true,
    stream: true,
    fs: 'empty'
  },
  resolve: {
    extensions: ['*', '.mjs', '.js', '.json']
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto"
      }
    ] 
  }
}
