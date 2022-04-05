var stream = require('stream')

module.exports = class jsonStream {
  constructor (reply, size = 0) {
    this.reply = reply
    this.reply.raw.writeHead(200, { 'Content-Type': 'application/octet-stream', 'X-Content-Length': size })
    this.readable = new stream.Readable({ objectMode: true, read: () => {} })
    this.readable.setEncoding('UTF8')
    this.readable.pipe(this.reply.raw)
  }
  push (chunk = '') {
    if (chunk !== null) {
      try {
        chunk = JSON.stringify(chunk)
      } catch (e) {
        chunk = JSON.stringify({ data: chunk })
      }
    }
    this.readable.push(chunk)
  }
}