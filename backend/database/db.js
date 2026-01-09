const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'anjana',
  database: 'medsync'
});

db.connect((err) => {
  if (err) {
    console.log('❌ MySQL connection failed');
    console.error(err.message);
  } else {
    console.log('✅ MySQL connected successfully');
  }
});

module.exports = db;
