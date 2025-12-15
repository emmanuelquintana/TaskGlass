import 'dotenv/config';
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TraceIdInterceptor } from './common/interceptors/trace-id.interceptor';
import { RequestLoggerInterceptor } from './common/interceptors/request-logger.interceptor';
import { ResponseWrapInterceptor } from './common/interceptors/response-wrap.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1');

  app.enableShutdownHooks();

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173'],
    credentials: true
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new TraceIdInterceptor(), new ResponseWrapInterceptor(reflector), new RequestLoggerInterceptor());

  const config = new DocumentBuilder()
    .setTitle('TaskGlass API')
    .setDescription('TaskGlass backend API')
    .setVersion('0.1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
}

bootstrap();
