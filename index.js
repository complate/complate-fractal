const babel = require('babel-core')
const Adapter = require('@frctl/fractal').Adapter
const PseudoStream = require('./src/pseudo-stream')
// const Purdy = require('purdy')

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
    // Purdy(this);
    let views = {}
    this.views.forEach(view => (views[view.handle] = view.content))
    return Promise.resolve(this.compile(str))
  }

  compile (input) {
    return new Promise((resolve, reject) => {
      const createElement = require(this._config.bundlePath) // eslint-disable-line no-unused-vars
      const compiledString = babel.transform(input, babelConfig).code
      const fn = eval(compiledString) // eslint-disable-line no-eval
      const s = new PseudoStream()
      fn(s)
      resolve(s.read())
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
