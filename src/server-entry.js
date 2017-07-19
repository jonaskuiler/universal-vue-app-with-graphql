import { createApp } from './app'

export default (context) => {
  return new Promise((resolve, reject) => {
    const { app, apolloProvider, router } = createApp()
    const now = Date.now()
    const { url } = context
    const fullPath = router.resolve(url).route.fullPath

    if (fullPath !== url) {
      reject({ url: fullPath })
    }

    // set router's location
    router.push(url)

    // wait until router has resolved possible async hooks
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()

      // no matched routes
      if (!matchedComponents.length) {
        reject({ code: 404 })
      }

      Promise.all([
        apolloProvider.prefetchAll({
          route: router.currentRoute,
        }, matchedComponents)
      ]).then(() => {
        context.renderApolloState = () => `
          <script>${apolloProvider.exportStates()}</script>
        `

        resolve(app)
      }).catch(reject)
    }, reject)
  })
}
