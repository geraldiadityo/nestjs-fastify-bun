import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);
  const configService = app.get(ConfigService);
  app.enableShutdownHooks();
  await app.listen(configService.get('PORT'));
  logger.log(`Backend Service running on port ${configService.get('PORT')}`, 'Bootstrap', {context: 'Bootstrap'})
}
bootstrap();
