const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const { PrismaClient } = require("../../generated/client");

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST, // your database host
  port: process.env.DB_PORT, // your PORT
  user: process.env.DB_USER, // your database username
  password: process.env.DB_PASSWORD, // your database password
  database: process.env.DB_DATABASE, // optional, your database name
});

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
