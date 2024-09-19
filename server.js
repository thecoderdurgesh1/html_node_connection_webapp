const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
const port = 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.json());
app.use(cors());

// MySQL connection
const db = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "dummy_webapp",
});

db.connect((err) => {
	if (err) {
		console.error("Database connection failed: " + err.stack);
		return;
	}
	console.log("Connected to database.");
});

// This route will serve the index.html file
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Register API
app.post("/register", (req, res) => {
	const { fname, lname, email, phone, username, password } = req.body;

	const sql =
		"INSERT INTO users (fname, lname, email, phone, username, password) VALUES (?, ?, ?, ?, ?, ?)";
	db.query(
		sql,
		[fname, lname, email, phone, username, password],
		(err, result) => {
			if (err) {
				res.status(500).send({ message: "Database error" });
			} else {
				res.status(200).send({ message: "User registered successfully" });
			}
		}
	);
});

// Login API
app.post("/login", (req, res) => {
	const { username, password } = req.body;

	const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
	db.query(sql, [username, password], (err, result) => {
		if (err) {
			res.status(500).send({ message: "Database error" });
		} else if (result.length > 0) {
			const fname = result[0].fname; // Retrieve fname from the database
			res.status(200).send({ message: "Login successful", fname: fname });
		} else {
			res.status(401).send({ message: "Invalid credentials" });
		}
	});
});

// Fetch All Users API
app.get("/users", (req, res) => {
	const sql = "SELECT id, fname, lname, email, phone, username FROM users";
	db.query(sql, (err, result) => {
		if (err) {
			res.status(500).send({ message: "Database error" });
		} else {
			res.status(200).send({ users: result });
		}
	});
});

// Delete User API
app.delete("/users/:id", (req, res) => {
	const userId = req.params.id;
	const sql = "DELETE FROM users WHERE id = ?";

	db.query(sql, [userId], (err, result) => {
		if (err) {
			res.status(500).send({ success: false, message: "Error deleting user" });
		} else {
			res
				.status(200)
				.send({ success: true, message: "User deleted successfully" });
		}
	});
});

// Start the server
app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
