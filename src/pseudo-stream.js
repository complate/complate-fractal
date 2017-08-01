class PseudoStream {
  constructor (doctype) {
    this._buffer = []
    if (doctype) {
      this._buffer.push(doctype)
    }
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
