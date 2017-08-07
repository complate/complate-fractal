const babel = require('babel-core')
const fractal = require('@frctl/fractal')
const Adapter = fractal.Adapter
const utils = fractal.utils
const PseudoStream = require('./pseudo-stream')
const html = require('html')

const babelConfig = {
  plugins: [
    ['transform-react-jsx', { pragma: 'createElement' }]
  ]
}

class ComplateAdapter extends Adapter {
  constructor (source, app, config = {}) {
    super(null, source)
    this._app = app
    this._config = config
    // this._handlePrefix = '$'
  }

  render (path, str, context, meta) {
    return Promise.resolve(this.compile(str, context, meta))
  }

  renderLayout (path, str, context, meta) {
    const replacedString = str.replace('###yield###', context.yield)
    return Promise.resolve(this.compile(replacedString, context, meta))
  }

  compile (input, context, { _self, target, env }) {
    return new Promise((resolve, reject) => {
      const _config = this._app._config // eslint-disable-line no-unused-vars
      const path = this.path(env).bind(this) // eslint-disable-line no-unused-vars
      const createElement = require(this._config.bundlePath) // eslint-disable-line no-unused-vars
      let js = babel.transform(input, babelConfig).code
      const fn = eval(js) // eslint-disable-line no-eval
      const s = new PseudoStream(target && '<!DOCTYPE html>')
      fn(s)
      resolve(html.prettyPrint(s.read()))
    })
  }

  path (env) {
    return function (pathStr) {
      const request = env.request

      if (!env || env.server) {
        return pathStr
      } else if (request && request.path) {
        return utils.relUrlPath(pathStr, request.path, this._app.web.get('builder.urls'))
      } else {
        return utils.relUrlPath(pathStr, '/', this._app.web.get('builder.urls'))
      }
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
