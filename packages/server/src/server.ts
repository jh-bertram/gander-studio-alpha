import Fastify from 'fastify';
import cors from '@fastify/cors';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { GANDER_ROOT, LOADOUTS_DIR, SERVER_PORT } from './env.js';
import { appRouter } from './router.js';

const server = Fastify({ logger: false });

await server.register(cors, { origin: '*' });
await server.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: { router: appRouter },
});

try {
  await server.listen({ port: SERVER_PORT, host: '127.0.0.1' });
} catch (err) {
  if ((err as NodeJS.ErrnoException).code === 'EADDRINUSE') {
    process.stderr.write(
      `✗ Port ${SERVER_PORT} is already in use.\n` +
      `  Kill the existing process: lsof -ti:${SERVER_PORT} | xargs kill -9\n` +
      `  Then run: npm run dev\n`
    );
    process.exit(1);
  }
  throw err;
}

console.log(`[gander-studio] server listening on http://127.0.0.1:${SERVER_PORT}`);
console.log(`[gander-studio] GANDER_ROOT: ${GANDER_ROOT}`);
console.log(`[gander-studio] LOADOUTS_DIR: ${LOADOUTS_DIR}`);
