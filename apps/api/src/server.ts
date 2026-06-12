import app from './app.js';
import { env } from './config/env.js';
import prisma from './config/database.js';
import logger from './shared/utils/logger.js';

async function start(): Promise<void> {
  await prisma.$connect();
  logger.info('Conexión a base de datos establecida');

  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Servidor BIOTRACK iniciado');
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'Apagando servidor...');
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Servidor detenido');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  logger.error(err, 'Error fatal al iniciar el servidor');
  process.exit(1);
});
