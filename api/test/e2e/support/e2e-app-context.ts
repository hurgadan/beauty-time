import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../../../src/app.module';

let app: INestApplication | null = null;
let dataSource: DataSource | null = null;

export async function initE2eApp(): Promise<void> {
  if (app) {
    return;
  }

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  await app.init();

  dataSource = app.get(DataSource);
}

export async function closeE2eApp(): Promise<void> {
  if (app) {
    await app.close();
  }
  app = null;
  dataSource = null;
}

export function getE2eApp(): INestApplication {
  if (!app) {
    throw new Error('E2E app is not initialized');
  }

  return app;
}

export function getE2eDataSource(): DataSource {
  if (!dataSource) {
    throw new Error('E2E DataSource is not initialized');
  }

  return dataSource;
}
