require('reflect-metadata');
require('ts-node/register/transpile-only');
require('tsconfig-paths/register');

const path = require('path');
const { DataSource } = require('typeorm');
const { config } = require('./config');

const AppDataSource = new DataSource({
  ...config().databaseConnectionOptions,
  entities: [path.join(__dirname, '..', 'src', '**', '*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '..', 'src', '**', 'migrations', '*{.ts,.js}')],
  migrationsTableName: 'migrations',
});

module.exports = { AppDataSource };
