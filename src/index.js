const BufferedStream = require('./buffered-stream')
const generateView = require('./transpiler')
const { Adapter, utils } = require('fractal-fork').fractal
const prettier = require('prettier')
const path = require('path')

class ComplateAdapter extends Adapter {
  constructor (source, app, config) {
    super(null, source)
    this._app = app
    this._rootDir = config.rootDir
    this._generateURI = config.generateURI
    // optional settings (defaults provided via corresponding getters)
    this._envPath = config.envPath
    this._previewPath = config.previewPath
  }

  render (filepath, str, context, meta) {
    // populate components' application context (NB: not to be confused with Fractal's own `context`)
    const env = require(this.envPath)
    const assetPath = this.pathGenerator(meta.env)
    env.context.uri = (...args) => {
      // inject `assetPath` via invocation context
      const ctx = { assetPath }
      return this._generateURI.call(ctx, ...args)
    }
    // expose application context via Fractal's own context
    context.app = env.context

    const preview = meta.env.request.route.handle === 'preview' // XXX: brittle?
    try { // eslint-disable-next-line no-var
      var render = generateView(str, {
        rootDir: this._rootDir,
        previewPath: preview && this.previewPath
      })
    } catch (err) {
      return Promise.reject(generateError(err))
    }

    const stream = new BufferedStream()
    return new Promise((resolve, reject) => {
      try {
        render(stream, context, () => {
          let html = stream.read()
          html = prettier.format(html, { parser: 'html' })
          resolve(html)
        })
      } catch (err) {
        reject(generateError(err))
      }
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

  // NB: this getter ensures that `#componentsDir` access is deferred until
  //     `#_app._config` is populated, which is not necessarily the case within
  //     the constructor
  get envPath () {
    if (this._envPath === undefined) {
      this._envPath = path.resolve(this.componentsDir, 'env.js')
    }
    return this._envPath
  }

  // NB: cf. `#envPath`
  get previewPath () {
    if (this._previewPath === undefined) {
      this._previewPath = path.resolve(this.componentsDir, '_preview.jsx')
    }
    return this._previewPath
  }

  get componentsDir () {
    return this._app._config.components.path
  }
}

module.exports = function (config = {}) {
  return {
    register (source, app) {
      return new ComplateAdapter(source, app, config)
    }
  }
}

function generateError (err) {
  const prep = obj => obj.toString()
    .replace(/\033\[\d+m/g, '') // strip ANSI color codes
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') // HTML-encoding
  return new Error(`<pre>${prep(err)}\n----\n${prep(err.stack)}</pre>`)
}
