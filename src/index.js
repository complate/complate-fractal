const babel = require('babel-core')
const { Adapter, utils } = require('@frctl/fractal')
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

  compile (input, context, { _self, target, env }) {
    return new Promise((resolve, reject) => {
      const _config = this._app._config // eslint-disable-line no-unused-vars
      const path = this.pathGenerator(env) // eslint-disable-line no-unused-vars
      const createElement = require(this._config.bundlePath) // eslint-disable-line no-unused-vars

      const { code } = babel.transform(input, babelConfig)
      const render = eval(code) // eslint-disable-line no-eval

      const stream = new PseudoStream()
      if (target) { // indicates that we're rendering a document rather than a fragment
        stream.writeln('<!DOCTYPE html>')
      }

      render(stream, true, () => {
        resolve(html.prettyPrint(stream.read()).replace('###yield###', context.yield))
      })
    })
  }

  pathGenerator (env) {
    return pathStr => {
      if (!env || env.server) {
        return pathStr
      }

      const { request } = env
      const uri = request && request.path || '/'
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
