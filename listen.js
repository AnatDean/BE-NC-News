const app = require('./app');
const {PORT = require('./config').PORT} = process.env

app.listen(PORT, function () {
  console.log(`listening on port ${PORT}`);
});