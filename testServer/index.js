import http from 'http'

let totalMemoryUsage = 0;
let testCount = 0;

const server = http.createServer((req, res) => {
  console.log(req.method, req.url)
  if (req.method === 'POST' && req.url === '/report/') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const data = JSON.parse(body);
      totalMemoryUsage += data.memoryUsage;
      testCount += 1;
      res.end('Data received');
    });
  } else if (req.method === 'GET' && req.url === '/report/') {
    const averageMemoryUsage = totalMemoryUsage / testCount;
    console.log(averageMemoryUsage)
    res.end(`Overall Average Memory Usage: ${averageMemoryUsage.toFixed(2)} MB`);
  } else {
    res.statusCode = 404;
    res.end();
  }
});

server.listen(3001, () => {
  console.log('Server running at http://localhost:3001/');
});