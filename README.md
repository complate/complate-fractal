# complate Adapter for Fractal

[![Build Status](https://travis-ci.org/complate/complate-fractal.svg?branch=master)](https://travis-ci.org/complate/complate-fractal)
[![Greenkeeper badge](https://badges.greenkeeper.io/complate/complate-fractal.svg)](https://greenkeeper.io/)

## Installation

Add complate-fractal to your Fractal-based styleguide project:

    npm install complate-fractal

or

    yarn add complate-fractal

## Configuring Fractal

In your project's `fractal.js`, you need to register complate as templating engine:

```javascript
let fractal = module.exports = require('@frctl/fractal').create()
let complate = require('complate-fractal')

…

fractal.components.engine(complate({
  rootDir: __dirname,
  generateURI: function(uri) {
    // NB: invocation context is `{ assetPath }`, providing access to
    //     Fractal-specific URI generation
    return this.assetPath(uri)
  }
}));
```

`rootDir` specifies which directory component samples' import paths are relative to:

```jsx
import MyWidget from './components/my-widget'

<MyWidget …>
```

`generateURI` implements an application-specific URI helper, provided to
components via the application context (via `envPath`, defaults to `env.js`):

```javascript
// application-specific context; this will be populated (i.e. mutated) at
// runtime by the respective application
exports.context = {
  uri: function toBeDefined() {
    throw new Error("application context is not defined");
  }
};
```

```jsx
import { context } from '../env'

export default function MyWidget (params, ...children) {
  let uri = context.uri('/path/to/resource')
  …
}
```

In addition, you need to provide a `PreviewLayout` component (via `previewPath`,
which defaults to `_preview.jsx` within the components directory):

```jsx
export default function PreviewLayout({ context }, ...children) {
  return <html lang="en">
    …
    <body>
      …
      {children}
      …
    </body>
  </html>;
}
```

## Usage with Fractal

### Context

You need to reference context values via the `context` object:

```jsx
<MyWidget>{context.my_label}</MyWidget>
```

### Referencing components

Fractal (with Handlebars) brings support for including existing components
within others:

```handlebars
<div class="my-component">
  {{> @my_other_component }}
</div>
```

complate has its own way for doing that by using HTML expansion without any
special markers or syntax you have to remember:

```jsx
<MyComponent>
  <MyOtherComponent />
</MyComponent>
```

Therefore we don’t support Fractal's `@`-prefixed view handlers for now.

## Examples

- [innoQ Styleguide and Component Library](https://github.com/innoq/innoq-styleguide)

## Development

### Release

1. Increment version number in `package.json`
2. Commit as "vX.X.X"
3. `git tag -am "vX.X.X" "X.X.X"`
4. `git push --follow-tags`
