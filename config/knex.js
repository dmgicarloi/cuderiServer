module.exports = {
  client: "pg",
  connection: {
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
  }
};
