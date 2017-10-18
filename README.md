[![Build Status](https://travis-ci.org/complate/complate-fractal.svg?branch=master)](https://travis-ci.org/complate/complate-fractal)

# complate Adapter for Fractal

## Installation

Add complate-fractal to your Fractal-based styleguide project:

    npm install complate-fractal

or

    yarn add complate-fractal

## Configure Fractal

```javascript
// fractal.js
//
// Require the complate adapter for Fractal and configure it
const complate = require('complate-fractal')
const componentsDir = path.join(__dirname, 'components')

fractal.components.set('ext', '.html')
fractal.components.engine(complate({
  rootDir: __dirname,
  // envPath: path.resolve(componentsDir, 'env.js'),
  // previewPath: path.resolve(componentsDir, '_preview.jsx'),
  generateURI: function (uri) { // Don't use () to avoid this binding
    return this.assetPath(uri)
  }
}))
fractal.components.set('path', componentsDir)
fractal.components.set('ext', '.html')
```

## Usage with Fractal

### Context

You need to reference context values via the `context` object:

```jsx
<my-component>{context.my_label}</my-component>
```

### Referencing components

Fractal (with Handlebars) brings support for including existing components within others:

```handlebars
<div class="my-component">
  {{> @my_other_component }}
</div>
```

complate has its own way for doing that by using HTML-expansion without any
special markers or syntax you have to remember:

```jsx
<my-component>
  <my-other-component />
</my-component>
```

Therefore we don’t support Fractal's `@`-prefixed view handlers for now.

## Examples

- [innoQ Styleguide and Component Library](https://github.com/innoq/innoq-styleguide)

## Development

### Release

1. Increment version number in `package.json`
2. Commit as "vX.X.X"
3. `git tag -am "vX.X.X" X.X.X`
4. `git push --follow-tags`
