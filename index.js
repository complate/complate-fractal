const babel = require('babel-core')
const Adapter = require('@frctl/fractal').Adapter
const PseudoStream = require('./src/pseudo-stream')
const html = require('html')
// const p = require('purdy')

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
  }

  render (path, str, context, meta) {
    // let views = {}
    // this.views.forEach(view => (views[view.handle] = view.content))
    return Promise.resolve(this.compile(str, context, { _self: meta.self }))
  }

  renderLayout (path, str, context, meta) {
    const replacedString = str.replace('###yield###', context.yield)
    return Promise.resolve(this.compile(replacedString, context, { _self: meta.self, _target: meta.target }))
  }

  compile (input, context, { _self, _target }) {
    return new Promise((resolve, reject) => {
      const _config = this._app._config // eslint-disable-line no-unused-vars
      const createElement = require(this._config.bundlePath) // eslint-disable-line no-unused-vars
      const compiledString = babel.transform(input, babelConfig).code
      const fn = eval(compiledString) // eslint-disable-line no-eval
      const s = new PseudoStream()
      fn(s)
      resolve(html.prettyPrint(s.read()))
    })
  }
}

module.exports = function (config = {}) {
  return {
    register (source, app) {
      return new ComplateAdapter(source, app, config)
    }
  }
}
