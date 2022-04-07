const stream = require('stream')
const through = require('through')

const stringify = function (op, sep, cl, indent) {
  indent = indent || 0
  if (op === false){
    op = ''
    sep = '\n'
    cl = ''
  } else if (op == null) {
    op = '[\n'
    sep = '\n,\n'
    cl = '\n]\n'

  }
  let stream
  let first = true
  let anyData = false
  stream = through(function (data) {
    anyData = true
    let json
    try {
      json = JSON.stringify(data, null, indent)
      json = json.replace(/^"|"$|\\/g, '')
    } catch (err) {
      return stream.emit('error', err)
    }
    if(first) {
      first = false
      stream.queue(op + json)
    } else {
      stream.queue(sep + json)
    }
  },
  function () {
    if(!anyData) {
      stream.queue(op)
    }
    stream.queue(cl)
    stream.queue(null)
  })
  return stream
}

module.exports = class jsonStream {
  constructor (reply, size = 0) {
    this.reply = reply
    this.reply.raw.writeHead(200, { 'Content-Type': 'application/octet-stream;charset=UTF-8', 'X-Content-Length': size })
    this.readable = new stream.Readable({ objectMode: true, read: () => {} })
    this.readable.setEncoding('UTF8')
    this.readable.pipe(stringify('[', ',', ']')).pipe(this.reply.raw)
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