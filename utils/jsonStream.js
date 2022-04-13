const stream = require('stream')
const through = require('through')

function stringify (indent = 0) {
  const open = '['
  const sep = ','
  const close = ']'

  let first = true, anyData = false
  const stream = through(function (data) {
      anyData = true
      let json
      try {
          json = JSON.stringify(data, null, indent)
          json = json.replace(/^"|"$|\\/g, '')
      } catch (err) {
          return stream.emit('error', err)
      }
      if (first) {
          first = false
          stream.queue(open + json)
      } else {
          stream.queue(sep + json)
      }
  },
  function () {
      if (!anyData) {
          stream.queue(open + close)
      } else {
          stream.queue(close)
      }
      stream.queue(null)
  })

  return stream
}

module.exports = class jsonStream {
  constructor (reply, size = 0) {
    this.reply = reply
    this.readable = new stream.Readable({ objectMode: true, read: () => {} })
    this.readable.setEncoding('UTF8')
    this.reply
      .code(200)
      .header('Content-Type', 'application/octet-stream;charset=UTF-8')
      .header('X-Content-Length', size)
      .send(this.readable.pipe(stringify()))
  }
  push (chunk = '') {
    if (chunk !== null) {
      try {
        chunk = JSON.stringify(chunk)
      } catch (e) {
        chunk = JSON.stringify({ data: chunk, typeOf: chunk.constructor })
      }
    }
    this.readable.push(chunk)
  }
}