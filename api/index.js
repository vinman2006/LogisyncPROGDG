import { createNeonApiMiddleware } from '../server/apiMiddleware.js';

const apiMiddleware = createNeonApiMiddleware();

export default function handler(req, res) {
  return new Promise((resolve) => {
    apiMiddleware(req, res, () => {
      if (!res.writableEnded) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Endpoint Not Found', path: req.url }));
      }
      resolve();
    });
  });
}
