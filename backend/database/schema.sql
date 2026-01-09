CREATE DATABASE IF NOT EXISTS medsync;
USE medsync;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  role ENUM('donor','hospital','ngo'),
  email VARCHAR(100)
);

CREATE TABLE supplies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donor_name VARCHAR(100),
  item_name VARCHAR(100),
  quantity INT,
  expiry_date DATE
);

CREATE TABLE requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hospital_name VARCHAR(100),
  item_name VARCHAR(100),
  quantity INT,
  urgency ENUM('emergency','normal')
);
