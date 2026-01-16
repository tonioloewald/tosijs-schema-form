const server = Bun.serve({
  port: 3456,
  async fetch(req) {
    const url = new URL(req.url)
    let path = url.pathname
    
    if (path === '/') {
      path = '/index.html'
    }
    
    const filePath = '.' + path
    const file = Bun.file(filePath)
    
    if (await file.exists()) {
      // Let Bun handle TypeScript transpilation
      if (path.endsWith('.ts')) {
        const transpiler = new Bun.Transpiler({ loader: 'ts' })
        const code = await file.text()
        const result = transpiler.transformSync(code)
        return new Response(result, {
          headers: { 'Content-Type': 'application/javascript' }
        })
      }
      return new Response(file)
    }
    
    return new Response('Not found', { status: 404 })
  }
})

console.log(`Server running at http://localhost:${server.port}`)
