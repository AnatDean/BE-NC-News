const app = require('./app');
const {PORT} = process.env || require('./config');


app.listen(PORT, function () {
  console.log(`listening on port ${PORT}`);
});