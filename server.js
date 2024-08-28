const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtExceptions', (err) => {
  //CLOSING SERVER IS NOT AN OPTION
  console.log(err.name, err.message);
  console.log('Uncaught Exception! 💥 Shutting Down...');
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log(`DB connection successful!🥳`));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled Rejection! 💥, Shutting Down....');
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtExceptions', (err) => {
  //CLOSING SERVER IS NOT AN OPTION
  console.log(err.name, err.message);
  console.log('Uncaught Exception! 💥 Shutting Down...');
  server.close(() => {
    process.exit(1);
  });
});
