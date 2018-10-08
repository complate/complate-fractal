// pseudo-stream, buffering contents to be consumed afterwards as a single string
module.exports = class BufferedStream {
  constructor () {
    this._buffer = []
  }

  writeln (msg) {
    this.write(`${msg}\n`)
  }

  write (msg) {
    this._buffer.push(msg)
  }

  flush () {
    // no-op
  }

  read () {
    return this._buffer.join('')
  }
}
