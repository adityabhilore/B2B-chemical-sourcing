import app from './app.js';
import { config } from './config/index.js';
import { prisma } from './lib/prisma.js';
import { verifyMailer } from './lib/mailer.js';

let activeServer;

function listen(port, attempts = 0) {
  const server = app.listen(port);
  server.once('listening', async () => {
    activeServer = server;
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Health: http://localhost:${port}/api/health`);
    if (port !== config.port) console.warn(`Configured port ${config.port} was occupied; using ${port}.`);
    try {
      await verifyMailer();
    } catch (error) {
      console.warn(`SMTP startup check failed: ${error.message}`);
    }
  });
  server.once('error', (error) => {
    if (error.code === 'EADDRINUSE' && config.isDev && attempts < 10) {
      console.warn(`Port ${port} is busy; trying ${port + 1}...`);
      listen(port + 1, attempts + 1);
      return;
    }
    console.error(error.code === 'EADDRINUSE' ? `No free port found starting at ${config.port}.` : 'Server failed to start:', error.message);
    process.exitCode = 1;
  });
  return server;
}

listen(config.port);

async function shutdown(signal) {
  console.log(`${signal} received; closing server`);
  if (!activeServer) {
    await prisma.$disconnect();
    return;
  }
  activeServer.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
