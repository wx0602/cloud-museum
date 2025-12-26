const https = require('https')

const sendJson = (res, status, data) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.end(JSON.stringify(data))
}

module.exports = (req, res) => {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.end()
    return
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'method_not_allowed' })
    return
  }

  const API_KEY = process.env.DEEPSEEK_API_KEY
  if (!API_KEY) {
    sendJson(res, 500, { error: 'missing_api_key' })
    return
  }

  const chunks = []
  req.on('data', (c) => chunks.push(c))
  req.on('end', () => {
    let body = {}
    try {
      body = JSON.parse(Buffer.concat(chunks).toString() || '{}')
    } catch (_) { }

    const messages = body.messages || []
    const isStream = !!body.stream

    const reqBody = JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: 0.7,
      stream: isStream,
    })

    const options = {
      hostname: 'api.deepseek.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(reqBody),
        Authorization: `Bearer ${API_KEY}`,
      },
    }

    const upstreamReq = https.request(options, (upstreamRes) => {
      if (isStream) {
        res.writeHead(upstreamRes.statusCode || 200, {
          ...upstreamRes.headers,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        })
        upstreamRes.pipe(res)
        return
      }

      const dsChunks = []
      upstreamRes.on('data', (d) => dsChunks.push(d))
      upstreamRes.on('end', () => {
        const raw = Buffer.concat(dsChunks).toString()

        res.statusCode = upstreamRes.statusCode || 200
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
        res.end(raw)
      })
    })

    upstreamReq.on('error', (err) => {
      sendJson(res, 502, { error: 'upstream_error', details: err?.message || 'unknown' })
    })

    upstreamReq.write(reqBody)
    upstreamReq.end()
  })
}