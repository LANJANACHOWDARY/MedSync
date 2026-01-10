const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// DATABASE CONNECTION
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'anjana', // Your password from the screenshot
    database: 'medsync'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL Database!');
});

// 1. ADD DONATION (From Donor)
app.post('/add-donation', (req, res) => {
    const { donor_id, medicine_name, expiry_date, quantity, blood_group } = req.body;
    const sql = "INSERT INTO donations (donor_id, medicine_name, expiry_date, quantity, blood_group, status) VALUES (?, ?, ?, ?, ?, 'available')";
    db.query(sql, [donor_id, medicine_name, expiry_date, quantity, blood_group], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(200).json({ message: "Donation added successfully!" });
    });
});

// 2. VIEW AVAILABLE DONATIONS
app.get('/view-donations', (req, res) => {
    const sql = "SELECT * FROM donations WHERE status = 'available'";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// 3. REQUEST SUPPLY (From Hospital)
app.post('/request-supply', (req, res) => {
    const { hospital_id, item_name, quantity_needed, unit, priority, location } = req.body;
    const sql = "INSERT INTO supply_requests (hospital_id, item_name, quantity_needed, unit, priority, location, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')";
    db.query(sql, [hospital_id, item_name, quantity_needed, unit, priority, location], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(200).json({ message: "Request posted successfully!" });
    });
});

// 4. VIEW PENDING REQUESTS
app.get('/view-requests', (req, res) => {
    const sql = "SELECT * FROM supply_requests WHERE status = 'pending'";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// 5. ALLOCATE SUPPLY (From NGO)
app.post('/allocate-supply', (req, res) => {
    const { ngo_id, request_id, donation_id } = req.body;
    const sqlAlloc = "INSERT INTO allocations (ngo_id, request_id, donation_id) VALUES (?, ?, ?)";
    
    db.query(sqlAlloc, [ngo_id, request_id, donation_id], (err) => {
        if (err) return res.status(500).json(err);
        
        // Update statuses so they don't show up in "pending" anymore
        db.query("UPDATE supply_requests SET status = 'allocated' WHERE id = ?", [request_id]);
        db.query("UPDATE donations SET status = 'claimed' WHERE id = ?", [donation_id]);
        
        res.status(200).json({ message: "Allocation successful!" });
    });
});

// 6. VIEW ALLOCATIONS (History)
app.get('/view-allocations', (req, res) => {
    const sql = "SELECT * FROM allocations";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});