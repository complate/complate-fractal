[![Build Status](https://travis-ci.org/complate/complate-fractal.svg?branch=master)](https://travis-ci.org/complate/complate-fractal)

# complate Adapter for Fractal

## Installation

Add complate-fractal to your Fractal-based styleguide project:

    npm install complate-fractal

## Configure Fractal

In your Fractal project you must first set up transpiling of your complate
template macros. One way to do this is by using [faucet](https://github.com/faucet-pipeline/faucet-pipeline-js).

The path to the transpiled bundle of complate macros then needs to be passed into
the adapter:

```javascript
// fractal.js
const complateAdapter = require('complate-fractal')({
  bundlePath: path.join(__dirname, 'dist', 'bundle.js')
})

// …

fractal.components.engine(complateAdapter)
fractal.components.set('ext', '.jsx')
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

## To do

- Implement  `path` helper for Fractal components
