class PseudoStream {
  constructor () {
    this._buffer = []
  }

  read () {
    return this._buffer.join('')
  }

  writeln (str) {
    this.write(`${str}\n`)
  }

  write (str) {
    this._buffer.push(str)
  }

  flush () {
    // no-op
  }
}

module.exports = PseudoStream
