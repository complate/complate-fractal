class PseudoStream {
  constructor (cb) {
    this._buffer = []
    this._callback = cb
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
