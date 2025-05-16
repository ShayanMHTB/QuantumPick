import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'], // Enhanced logging
  });

  // Apply security headers
  app.use(helmet());

  // Enable CORS with environment variables and fallbacks
  app.enableCors({
    origin: [
      process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:4000',
      'http://localhost:3000',
      // Additional origins for production/staging
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Global exception filter for consistent error responses
  app.useGlobalFilters(new HttpExceptionFilter());

  // Enhanced validation with helpful error messages
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      errorHttpStatusCode: 422, // Unprocessable Entity for validation errors
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // API versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('QuantumPick API')
    .setDescription('The QuantumPick Web3 Lottery Platform API')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('wallets', 'Wallet management')
    .addTag('profiles', 'User profile management')
    .addTag('lotteries', 'Lottery operations')
    .addTag('tickets', 'Ticket management')
    .addTag('web3', 'Blockchain interactions')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter JWT token',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Enhanced Swagger setup
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // Swagger JSON endpoint
  app.use('/api/docs-json', (req, res) => {
    res.json(document);
  });

  // Get port from environment with fallback
  const port = process.env.NEST_PORT || 3000;

  // Start server
  await app.listen(port);

  console.log(`QuantumPick API running on port ${port}`);
  console.log(
    `Swagger documentation: ${process.env.NEXT_PUBLIC_API_URL || `http://localhost:${port}`}/api/docs`,
  );
  console.log(
    `Swagger JSON: ${process.env.NEXT_PUBLIC_API_URL || `http://localhost:${port}`}/api/docs-json`,
  );

  // Graceful shutdown
  const signals = ['SIGTERM', 'SIGINT'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      console.log(`Received ${signal}, gracefully shutting down...`);
      await app.close();
      process.exit(0);
    });
  });
}

bootstrap();
