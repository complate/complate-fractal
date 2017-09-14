const fs = require('fs')
const path = require('path')

// activate JSX support -- NB: this must be done before @std/esm
require('babel-register')({
  extensions: ['.jsx'],
  presets: ['es2015'],
  plugins: [
    ['transform-react-jsx', { pragma: 'createElement' }]
  ]
})
// activate support for ES6 import/export (required for complate-stream; `require`ing it here
// makes it work within the generated JSX module below, probably due to Node's module caching)
require = require('@std/esm')(module, { esm: 'all', cjs: true }) // eslint-disable-line no-global-assign
require('complate-stream')

module.exports = (jsx, { previewPath, rootDir, componentsDir }) => {
  // separate imports from markup snippet -- XXX: brittle, but good enough?
  const { imports, xml } = jsx.split(/\r\n|\r|\n/).reduce((memo, line) => {
    line = line.trim()
    if (!line) { // ignore blank lines
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

  imports.push("import renderer, { createElement } from 'complate-stream'")
  if (previewPath) {
    imports.push(`import PreviewLayout from '${previewPath}'`)
  }
  // generate macro -- XXX: brittle, but good enough?
  let code = xml.join('\n')
  if (previewPath) {
    code = `<PreviewLayout context={context}>${code}</PreviewLayout>`
  }
  code = `const generateMacro = context => { return () => ${code} }`
  // generate render function -- XXX: hard-coded doctype
  code = `${code}
const { renderView } = renderer('<!DOCTYPE html>')
const fragment = ${!previewPath}
export default (stream, context, callback) => {
  const wrapperMacro = generateMacro(context)
  renderView(wrapperMacro, {}, stream, fragment, callback)
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
