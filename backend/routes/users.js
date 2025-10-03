const express = require("express");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require("../config/database");
const { authenticateToken } = require("../auth/tokens");

const router = express.Router();

// Token verification
router.post("/verify-token", authenticateToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: req.user,
    message: "Token is valid" 
  });
});

// User login
router.post("/login", (req, res) => {
  const { website_login, password } = req.body;

  const loginQuery = "SELECT * FROM member_logins WHERE website_login = ?";
  
  db.query(loginQuery, [website_login], async (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const user = result[0];
    
    try {
      const validPassword = await bcrypt.compare(password, user.password);
      
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid Credentials" });
      }

      const token = jwt.sign(
        { 
          userId: user.user_id, 
          username: user.website_login
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        token: token,
        user_id: user.user_id,
        website_login: user.website_login,
        message: "Login successful",
      });
    } catch (error) {
      console.error("Password comparison error:", error);
      return res.status(500).json({ message: "Server Error" });
    }
  });
});

// Register user
router.post("/register", async (req, res) => {
  let { user_id, website_login, password } = req.body;
  const saltRounds = 11;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const loginQuery = "INSERT INTO member_logins (user_id, website_login, password) VALUES (?, ?, ?)";
  
  db.query(loginQuery, [user_id, website_login, passwordHash], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    return res.status(200).json({ message: "User Added Successfully" });
  });
});

// Add new member
router.post("/newMember", (req, res) => {
  let { user_id, first_name, last_name, email, phone_number, join_date } = req.body;
  
  if (!join_date) {
    const today = new Date();
    join_date = today.toISOString().slice(0, 10);
  }

  const memberQuery = "INSERT INTO members (user_id, first_name, last_name, email, phone_number, join_date, guest, paid) VALUES (?, ?, ?, ?, ?, ?, TRUE, FALSE)";
  
  db.query(memberQuery, [user_id, first_name, last_name, email, phone_number || null, join_date], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    return res.status(200).json({ message: "Member Added" });
  });
});

// Check monthly members
router.post("/checkMonthlyMembers", (req, res) => {
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();

  const monthlyMembersQuery = "SELECT SUBSTRING(website_login, 7)+1 as monthlyMembers FROM member_logins WHERE SUBSTRING(website_login, 1, 6) LIKE ? ORDER BY website_login DESC LIMIT 1";

  db.query(monthlyMembersQuery, [`${yyyy}${mm}%`], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    
    const monthlyMembers = result.length > 0 ? Number(result[0].monthlyMembers) : 1;
    
    return res.status(200).json({
      monthlyMembers: monthlyMembers,
      message: "Query Successful",
    });
  });
});

// Check if ID exists
router.post("/checkIDExists", (req, res) => {
  const { user_id } = req.body;
  const idExistsQuery = "SELECT * FROM members WHERE user_id = ?";
  
  db.query(idExistsQuery, [user_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    
    const exists = result.length > 0;
    return res.status(200).json({ 
      exists: exists, 
      message: exists ? "ID already Exists" : "ID Unique" 
    });
  });
});

module.exports = router;