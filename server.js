const mongoose = require('mongoose');

const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception!');
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database connection established!');
  });

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
  console.log(`app is running on port: ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled rejection!');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
