import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

// Determine development or production environment
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.NEXT_PORT, 10) || 3000; // Default to port 3000 internally

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Parse the URL
      const parsedUrl = parse(req.url, true);

      // Let Next.js handle the request
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(
        `> Ready on http://${hostname}:${port} - env ${process.env.NODE_ENV}`,
      );
      console.log(
        `> Note: Accessible on host machine at port ${
          process.env.HOST_NEXT_PORT || 4000
        }`,
      );
    });
});
