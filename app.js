const Promise = require('bluebird')
const icy = require('icy')
const fs = require('fs')
const prism = require('prism-media')
const app = require('fastify')({
  logger: true
})
const static = require('fastify-static')
const io = require('socket.io')()
const ss = require('socket.io-stream')
const path = require('path')

app.register(static, {
  root: path.join(__dirname, 'public'),
  prefix: '/public/' // optional: default '/'
})

app.get('/audio', (req, reply) => {
  const url = 'http://104.248.51.52:8000/radio.ogg'

  icy.get(url, res => {
    console.log(res.headers)

    res.on('metadata', metadata => {
      const parsed = icy.parse(metadata)
      console.log(parsed)
    })

    res.pipe(new prism.opus.OggDemuxer())
       .pipe(new prism.opus.Decoder({ rate: 44100, channels: 2, frameSize: 960 }))
    reply.send(res)
  })
})

app.get('/', (req, reply) => {
  reply.sendFile('index.html')
})

app.listen(3000, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`server listening on ${address}`)
})