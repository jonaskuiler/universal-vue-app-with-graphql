const LRU = require('lru-cache')
const { createBundleRenderer } = require('vue-server-renderer')

const cache = LRU({ max: 100, maxAge: 1000 })

// Is the request cachable?
const isCachable = req => false

// Is there a cache hit?
const getCacheHit = (req, res) => cache.get(req.url)

// Error handler
const handleError = (res, req, error) => {
  if (error.url) {
    return res.redirect(error.url)
  }

  if (error.code === 404) {
    return res.status(404).end('404 | Page Not Found')
  }

  res.status(500).end('500 | Internal Server Error')
}

// Create renderer
const createRenderer = (bundle, options) => {
  return createBundleRenderer(bundle, Object.assign({}, options, {
    inject: false,
    cache: LRU({
      max: 1000,
      maxAge: 1000 * 60 * 15
    }),
    runInNewContext: false
  }))
}

// Render function as a promise
const renderPromise = (renderer, context) => {
  return new Promise((resolve, reject) => {
    renderer.renderToString(context, (error, html) => {
      if (error) {
        return reject(error)
      }

      resolve(html)
    })
  })
}

// Create requested context
const createContext = (req) => ({
  title: 'Vue Apollo/SRR Demo',
  url: req.url
})

// Middleware wrapper
module.exports = (options) => {
  const {
    bundle,
    template,
    productionMode,
    serverInstance,
    clientManifest,
    createDevServer
  } = options

  let renderer
  let readyPromise

  if (productionMode) {
    renderer = createRenderer(bundle, {
      template,
      clientManifest
    })
  } else {
    readyPromise = createDevServer(serverInstance, (bundle, options) => {
      renderer = createRenderer(bundle, Object.assign({ template }, options))
    })
  }

  // Server side render
  const render = async (req, res) => {
    res.setHeader('Content-Type', 'text/html')

    const cacheHit = getCacheHit(req, res)

    if (cacheHit) {
      console.log(`> Cache hit time ${Date.now() - s}ms`)
      res.end(cacheHit)
      return
    }

    const cachable = isCachable(req)
    const context = createContext(req)
    const s = Date.now()

    try {
      const html = await renderPromise(renderer, context)

      if (cachable) {
        cache.set(req.url, html)
      }

      res.end(html)

      console.log(`> Server hit time ${Date.now() - s}ms`)
    } catch (error) {
      handleError(res, req, error)

      console.error(`> Error during render: ${req.url}`)
      console.error(error.stack)
    }
  }

  // Middleware
  return productionMode ? render : (req, res) => {
    readyPromise.then(() => render(req, res))
  }
}
