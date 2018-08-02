module.exports = {
  lintOnSave: false,
  devServer: {
    port: 8002,
    proxy: 'http://localhost:5500'
  },
  pwa: {
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'default'
  },
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.(graphql|gql)$/,
          exclude: /node_modules/,
          loader: 'graphql-tag/loader'
        }
      ]
    }
  },
  css: {
    loaderOptions: {
      sass: {
        data: `@import "@/assets/css/variables.scss";`
      }
    }
  }
}