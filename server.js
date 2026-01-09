const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(express.json());
app.use(cors());

// DATABASE CONNECTION
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'anjana', // <--- CHANGE THIS TO YOUR ACTUAL PASSWORD
    database: 'medsync'
});

db.connect((err) => {
    if (err) return console.error("DB Error: " + err);
    console.log('Connected to MySQL Database!');
});

// 1. LOGIN ROUTE (The one you were missing!)
app.post('/login', (req, res) => {
    const { email, password, role } = req.body;
    const sql = `SELECT id, username FROM ${role} WHERE email = ? AND password = ?`;
    
    db.query(sql, [email, password], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length > 0) {
            res.status(200).json({ message: "Login successful", user: results[0] });
        } else {
            res.status(401).send("Invalid email or password");
        }
    });
});

// 2. VIEW DONATIONS ROUTE
app.get('/view-donations', (req, res) => {
    // This query pulls everything and calculates if it's "Urgent" (expiring in < 30 days)
    const sql = `
        SELECT *, 
        CASE 
            WHEN DATEDIFF(expiry_date, CURDATE()) <= 30 THEN 'URGENT' 
            ELSE 'NORMAL' 
        END AS priority_status 
        FROM donations
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.status(200).json(results);
    });
});

// 3. ADD DONATION ROUTE
app.post('/add-donation', (req, res) => {
    // Add blood_group here 
    const { donor_id, medicine_name, expiry_date, quantity, blood_group } = req.body;
    
    // Update the SQL to include the new column
    const sql = "INSERT INTO donations (donor_id, medicine_name, expiry_date, quantity, blood_group) VALUES (?, ?, ?, ?, ?)";
    
    db.query(sql, [donor_id, medicine_name, expiry_date, quantity, blood_group || 'N/A'], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }
        res.status(200).send({ message: "Donation added successfully!" });
    });
});

// 4. HOSPITAL REGISTRATION (From Part 1)
app.post('/register-hospital', (req, res) => {
    const { username, email, password, hospital_name } = req.body;
    const sql = "INSERT INTO hospital (username, email, password, hospital_name) VALUES (?, ?, ?, ?)";
    db.query(sql, [username, email, password, hospital_name], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(200).send({ message: "Hospital added." });
    });
});
// 5. DONOR REGISTRATION
app.post('/register-donor', (req, res) => {
    const { username, email, password, location } = req.body;
    const sql = "INSERT INTO donor (username, email, password, location) VALUES (?, ?, ?, ?)";
    db.query(sql, [username, email, password, location], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(200).send({ message: "Donor added." });
    });
});

// 6. NGO REGISTRATION
app.post('/register-ngo', (req, res) => {
    const { username, email, password, registration_id } = req.body;
    const sql = "INSERT INTO ngo (username, email, password, registration_id) VALUES (?, ?, ?, ?)";
    db.query(sql, [username, email, password, registration_id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(200).send({ message: "NGO added." });
    });
});

// 7. CLAIM DONATION (Critical for the website to work!)
app.post('/claim-donation', (req, res) => {
    const { donation_id } = req.body;
    // Updates the status so other hospitals can't see it anymore
    const sql = "UPDATE donations SET status = 'claimed' WHERE id = ?";
    db.query(sql, [donation_id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(200).send({ message: "Medicine claimed successfully!" });
    });
});


// --- ALWAYS KEEP THIS AT THE VERY BOTTOM ---
app.listen(5000, () => {
    console.log("Server running on port 5000");
});