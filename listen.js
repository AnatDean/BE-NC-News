const app = require('./app');
const {PORT} = require('./config') || 3000

app.listen(PORT, function () {
  console.log(`listening on port ${PORT}`);
});