const express = require('express')
const path = require('path')
const { createProxyMiddleware } = require('http-proxy-middleware')

const app = express()
const port = process.env.PORT || 3000
const distPath = path.join(__dirname, 'dist')

// Proxy API requests to backend Flask server
app.use('/api', createProxyMiddleware({ target: 'http://localhost:5000', changeOrigin: true, logLevel: 'warn' }))

app.use(express.static(distPath))

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(port, () => {
  console.log(`Frontend server running at http://localhost:${port}`)
})
