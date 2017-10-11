const PseudoStream = require('./pseudo-stream')
const generateView = require('./transpiler')
const { Adapter, utils } = require('@frctl/fractal')
const { prettyPrint } = require('html')

class ComplateAdapter extends Adapter {
  constructor (source, app, config) {
    super(null, source)
    this._app = app
    this._rootDir = config.rootDir
    this._envPath = config.envPath
    this._previewPath = config.previewPath
    this._appContext = config.appContext
  }

  render (filepath, str, context, meta) {
    const componentsDir = this._app._config.components.path

    // populate components' application context (NB: not to be confused with Fractal's own `context`)
    const env = require(this._envPath)
    const assetPath = this.pathGenerator(meta.env)
    env.context.uri = (...args) => {
      // inject `assetPath` via invocation context
      const ctx = { assetPath }
      return this._appContext.uri.call(ctx, ...args)
    }
    // expose application context via Fractal's own context
    context.app = env.context

    const preview = meta.env.request.route.handle === 'preview' // XXX: brittle?
    const render = generateView(str, {
      previewPath: preview && this._previewPath,
      rootDir: this._rootDir,
      componentsDir
    })

    const stream = new PseudoStream()
    return new Promise(resolve => {
      render(stream, context, () => {
        let html = stream.read()
        html = prettyPrint(html)
        resolve(html)
      })
    })
  }

  pathGenerator (env) {
    return pathStr => {
      if (!env || env.server) {
        return `/${pathStr}`
      }

      const { request } = env
      const uri = (request && request.path) || '/'
      return utils.relUrlPath(pathStr, uri, this._app.web.get('builder.urls'))
    }
  }
}

module.exports = function (config = {}) {
  return {
    register (source, app) {
      return new ComplateAdapter(source, app, config)
    }
  }
}
