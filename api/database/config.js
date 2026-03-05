const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

function config() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('Missing required environment variable: DATABASE_URL');
  }

  return {
    databaseConnectionOptions: {
      type: 'postgres',
      url: databaseUrl,
      synchronize: false,
    },
  };
}

module.exports = { config };
