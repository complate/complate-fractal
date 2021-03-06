const fs = require('fs')
const path = require('path')

// activate JSX support -- NB: this must be done before @std/esm
require('@babel/register')({
  extensions: ['.jsx'],
  ignore: [], // activates transpilation for third-party modules
  presets: ['@babel/preset-env'],
  plugins: [
    ['@babel/plugin-transform-react-jsx', {
      pragma: 'createElement',
      pragmaFrag: 'Fragment'
    }]
  ]
})
// activate support for ES6 import/export syntax (required for non-JSX ES6 modules, notably complate-stream)
require = require('esm')(module) // eslint-disable-line no-global-assign
// `require`ing non-JSX ES6 modules here makes `import`s work within JSX modules, because here we have access to
// @std/esm's `require` and can thus prepopulate Node's module cache appropriately
require('complate-stream')

module.exports = (jsx, { rootDir, previewPath }) => {
  // separate imports from markup snippet -- XXX: brittle, but good enough?
  const { imports, xml } = jsx.split(/\r\n|\r|\n/).reduce((memo, line) => {
    if (!line.trim()) { // ignore blank lines
      return memo
    }

    if (memo.split || !/^import\b/.test(line)) {
      memo.split = true
      memo.xml.push(line)
    } else {
      memo.imports.push(line)
    }
    return memo
  }, {
    imports: [],
    xml: [],
    split: false
  })

  imports.push("import Renderer, { Fragment, createElement } from 'complate-stream'")
  if (previewPath) {
    // avoid accidental string escaping due to Windows-style path separators
    if (path.sep === '\\') {
      previewPath = previewPath.replace(/\\/g, '/')
    }
    imports.push(`import PreviewLayout from '${previewPath}'`)
  }
  // generate macro -- XXX: brittle, but good enough?
  let code = xml.join('\n')
  if (previewPath) {
    code = `<PreviewLayout context={context}>${code}</PreviewLayout>`
  }
  code = `
const generateMacro = context => {
  return () => <Fragment>${code}</Fragment>
}`
  // generate render function -- XXX: hard-coded doctype
  code = `${code}
const { renderView } = new Renderer()
const fragment = ${!previewPath}
export default (stream, context, callback) => {
  const wrapperMacro = generateMacro(context)
  renderView(wrapperMacro, {}, stream, { fragment }, callback)
}`
  code = imports.concat(code).join('\n')

  const filepath = path.resolve(rootDir, `_view_${randomID()}.jsx`)
  fs.writeFileSync(filepath, code)
  try {
    var render = require(filepath).default // eslint-disable-line no-var
    delete require.cache[filepath]
  } finally {
    fs.unlinkSync(filepath)
  }

  return render
}

function randomID () {
  return Math.random().toString().substr(2) // XXX: crude
}
