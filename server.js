const app = require('./app');
const PORT = process.env.APP_PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
