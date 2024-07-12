import http from 'http'


let avgMemoryUsage = 0;
let maxMemoryUsage = 0;
let minMemoryUsage = 0;
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
      // avgMemoryUsage, maxMemoryUsage, minMemoryUsage})
      avgMemoryUsage += data.avgMemoryUsage;
      maxMemoryUsage += data.maxMemoryUsage;
      minMemoryUsage += data.minMemoryUsage;
      testCount += 1;
      res.end('Data received');
    });
  } else if (req.method === 'GET' && req.url === '/report/') {
    const avg = avgMemoryUsage / testCount;
    const max = maxMemoryUsage / testCount;
    const min = minMemoryUsage / testCount;
    console.log("avg-max:", avg.toFixed(0) + "/" + max.toFixed(0))
    // console.log("min:", min.toFixed(2))
    res.end()
  } else {
    res.statusCode = 404;
    res.end();
  }
});

server.listen(3001, () => {
  console.log('Server running at http://localhost:3001/');
});