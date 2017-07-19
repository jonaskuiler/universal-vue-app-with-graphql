const fs = require('fs')
const ssr = require('./middleware/vue-ssr')
const path = require('path')
const express = require('express')
const favicon = require('serve-favicon')
const compression = require('compression')
const resolve = file => path.resolve(__dirname, file)
const serve = (path, cache) => express.static(resolve(path), {
  maxAge: cache && isProd ? 1000 * 60 * 60 * 24 * 30 : 0
})

// Infinite stack traces
Error.stackTraceLimit = Infinity

const app = express()
const port = (process.env.PORT || 8080)
const isProd = (process.env.NODE_ENV === 'production')

// global middleware
app.use(compression({ threshold: 0 }))

// serve statics
app.use('/dist', serve('./dist', true))
app.use('/public', serve('./public', true))

let ssrConfig = {
  serverInstance: app,
  productionMode: isProd,
  template: fs.readFileSync(resolve('./src/index.template.html'), 'utf-8'),
  createDevServer: require('./build/setup-dev-server'),
  bundle: false,
  clientManifest: false
}

if (isProd) {
  ssrConfig = Object.assign({}, ssrConfig, {
    bundle: require('./dist/vue-ssr-server-bundle.json'),
    clientManifest: require('./dist/vue-ssr-client-manifest.json')
  })
}

// catch all route
app.get('*', ssr(ssrConfig))

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`)
})
