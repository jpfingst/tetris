const express = require('express')
const path = require('path')

const app = express()
const port = process.env.PORT || 3000
const distPath = path.join(__dirname, 'dist')

app.use(express.static(distPath))

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(port, () => {
  console.log(`Frontend server running at http://localhost:${port}`)
})
