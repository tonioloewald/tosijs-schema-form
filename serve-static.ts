Bun.serve({
  port: 3456,
  async fetch(req) {
    const url = new URL(req.url)
    let path = url.pathname === '/' ? '/index.html' : url.pathname
    const file = Bun.file('.' + path)
    if (await file.exists()) {
      return new Response(file)
    }
    return new Response('Not found', { status: 404 })
  }
})
console.log('Server running at http://localhost:3456')
