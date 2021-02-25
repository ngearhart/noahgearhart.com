/* eslint @typescript-eslint/no-var-requires: "off" */
/**
 * @file Configure Vue and webpack for Django.
 */
const BundleTracker = require('webpack-bundle-tracker')

/*

I'm going to do my best to document this but tbh a lot of it is copied.
1: splitChunks(false) prevents webpack from bundling the view app into different chunks to be rendered.
2. The BundleTracker pluging simply outputs all webpack stats to the webpack-stats.json file,
   this file is then used by Django's webpack_loader plugin to resolve the bundles in the templates.
3. watchOptions( poll: 1000) is to check for rebuilds every second
4. host('0.0.0.0') NOTE: THIS CANNOT BE localhost, since in docker the containers have different ip addresses.
Having the dev server listen on 0.0.0.0 is necessary because the django container will make a request on
127.0.0.1:8080 for the webpack bundle but the django local host is different from the frontend container localhost
as each docker container has its own ip address. e.g. web container can be 172.28.0.4 (this is what it was when I checked
but it can change) and the frontend container's ip address was 172.29.0.2. Thus a request from the web container localhost
(172.28.0.4) will not reach the frontend container (172.29.0.2). Thus, the solution is to make the dev server listen on all
ip addresses to avoid any more Docker networking nonsense.

*/

module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/noah/dist/' : 'http://localhost:8080',
  outputDir: '/noah/dist/',
  filenameHashing: true,
  chainWebpack: config => {
    config.optimization
      .splitChunks(false)

    config
      .plugin('BundleTracker')
      .use(BundleTracker, [{
        path: '/static/',
        filename: 'webpack-stats.json'
      }])

    config.resolve.alias
      .set('__STATIC__', 'static')

    config.devServer
      .publicPath('http://localhost:8080')
      .host('0.0.0.0')
      .port(8080)
      .hotOnly(true)
      .watchOptions({
        poll: 1000
      })
      .https(false)
      .headers({
        'Access-Control-Allow-Origin': ['*']
      })
  }
}
