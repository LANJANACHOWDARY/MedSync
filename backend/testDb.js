const db = require('./database/db');

db.query('SHOW TABLES', (err, results) => {
  if (err) {
    console.error(err);
  } else {
    console.log('✅ Tables:', results);
  }
  process.exit();
});
