import http from 'http';
import { handleCentralizedApi } from './centralizedServer.js';

const PORT = 5050;
const server = http.createServer(async (req, res) => {
  try {
    const handled = await handleCentralizedApi(req, res);
    if (!handled) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Endpoint not found' }));
    }
  } catch (err) {
    console.error('[Central Server Error]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Central Master Server] Running on http://0.0.0.0:${PORT} (Accessible by all network devices)`);
});
