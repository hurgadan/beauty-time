function config() {
  return {
    databaseConnectionOptions: {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      synchronize: false,
    },
  };
}

module.exports = { config };
