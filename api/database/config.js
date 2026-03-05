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
