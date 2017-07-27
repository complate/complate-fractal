# complate Adapter for Fractal

## Installation

    npm install https://github.com/complate/complate-fractal

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

## TODO / Things not working yet

* Layouts
* Prettify HTML output
