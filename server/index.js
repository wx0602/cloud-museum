const http = require('http')
const https = require('https')

const PORT = process.env.PORT || 3001
const API_KEY = process.env.DEEPSEEK_API_KEY || '' //这里填API

const send = (res, status, data, headers = {}) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    ...headers,
  })
  res.end(JSON.stringify(data))
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    send(res, 204, {})
    return
  }

  if (req.method === 'POST' && req.url === '/api/chat') {
    if (!API_KEY) {
      send(res, 500, { error: 'missing_api_key' })
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
      const isStream = body.stream || false

      const reqBody = JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.7,
        stream: isStream
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

      const dsReq = https.request(options, (dsRes) => {
        if (isStream) {
          res.writeHead(dsRes.statusCode, dsRes.headers)
          dsRes.pipe(res)
        } else {
          const dsChunks = []
          dsRes.on('data', (d) => dsChunks.push(d))
          dsRes.on('end', () => {
            try {
              const raw = Buffer.concat(dsChunks).toString()
              const json = JSON.parse(raw)
              send(res, dsRes.statusCode, json)
            } catch (e) {
              send(res, 500, { error: 'parse_error' })
            }
          })
        }
      })

      dsReq.on('error', () => {
        if (!res.headersSent) {
          send(res, 502, { error: 'upstream_error' })
        }
      })
      dsReq.write(reqBody)
      dsReq.end()
    })
    return
  }

  if (req.method === 'POST' && req.url === '/api/quiz/generate') {
    if (!API_KEY) {
      send(res, 500, { error: 'missing_api_key' })
      return
    }
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      let body = {}
      try {
        body = JSON.parse(Buffer.concat(chunks).toString() || '{}')
      } catch (_) { }
      const mode = body.mode || 'study'
      const topic = body.topic || '' // 获取前端传递的特定分类

      let promptTopic = ''
      if (topic) {
        promptTopic = `（侧重于${topic}领域）`
      } else {
        const topics = ["青铜器", "陶瓷", "书画", "玉器", "金银器", "佛教艺术", "古代货币", "少数民族文物", "考古遗址", "博物馆建筑", "文房四宝", "古代服饰", "秦汉文物", "隋唐文物", "宋元明清"]
        const randomTopic = topics[Math.floor(Math.random() * topics.length)]
        promptTopic = `（侧重于${randomTopic}领域）`
      }

      const prompt = `请生成5道与中国博物馆及馆藏文物${promptTopic}相关的单选题。题目需简洁明确，包含4个选项，且仅有一个正确答案。请返回严格的JSON，结构如下：[{"id":"string","stem":"string","options":[{"id":"A","text":"string"},{"id":"B","text":"string"},{"id":"C","text":"string"},{"id":"D","text":"string"}],"answerId":"A|B|C|D","explanation":"这里是简单的知识点解析","tags":["朝代","材质","展厅"]}]。不要附加解释。根据模式${mode}调整难度：study偏易、challenge偏难。请确保题目具有多样性，避免生成过于常见的题目（如后母戊鼎、长信宫灯等）。`

      const reqBody = JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一位博物馆问答出题专家，负责生成高质量的选择题。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
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

      const dsReq = https.request(options, (dsRes) => {
        const dsChunks = []
        dsRes.on('data', (d) => dsChunks.push(d))
        dsRes.on('end', () => {
          try {
            const raw = Buffer.concat(dsChunks).toString()
            const json = JSON.parse(raw)
            const content = json?.choices?.[0]?.message?.content?.trim() || ''
            let questions = []
            try {
              questions = JSON.parse(content)
            } catch (_) { }
            send(res, 200, { questions })
          } catch (e) {
            send(res, 500, { error: 'parse_error' })
          }
        })
      })

      dsReq.on('error', () => {
        send(res, 502, { error: 'upstream_error' })
      })
      dsReq.write(reqBody)
      dsReq.end()
    })
    return
  }

  send(res, 404, { error: 'not_found' })
})

server.listen(PORT)