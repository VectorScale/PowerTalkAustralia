const express = require("express");
const { db } = require("../config/database");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const router = express.Router();

// Register user
router.post("/users/register", async (req, res) => {
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
router.post("/users/login", async (req, res) => {
  const { website_login, password } = req.body;

  // SQL query with placeholders for Email and Password
  const loginQuery =
    "SELECT member_logins.user_id, member_logins.website_login, member_logins.password, board_members.level_of_access FROM member_logins LEFT JOIN board_members ON member_logins.user_id=board_members.user_id WHERE website_login = ? AND password = ?";

  db.query(loginQuery, [website_login, password], (err, result) => {
    const user = result[0];

    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.website_login,
        access: user.level_of_access
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    if(/^$/.test(user.password)){
      const isValidPassword = bcrypt.compare(password, user.password);
      if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    if (result.length > 0) {
      //console.log(token)
      res.json({
        success: true,
        token: token,
        user_id: user.user_id,
        website_login: user.website_login,
        password: user.password,
        message: "Login successful",
      });
    } else {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

  });
});

// Add new member
router.post("/users/newMember", (req, res) => {
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
router.post("/users/checkMonthlyMembers", (req, res) => {
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
router.post("/users/checkIDExists", (req, res) => {
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

router.get("/profile/:id", (req, res) => {
  const userId = req.params.id;
  const Query = "SELECT * FROM members WHERE user_id = ?";
  db.query(Query, [userId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    if (result.length > 0) {
      const user = result[0];

      res.json(user);
    }
  });
});
router.post("/profile/edit/", (req, res) => {
  const {
    profile_id,
    first_name,
    last_name,
    email,
    phone_number,
    address,
    postcode,
    interests,
    pronouns,
    dob,
  } = req.body;
  const editProfileQuery =
    "UPDATE members SET first_name = ?, last_name = ?, email = ?, phone_number = ?, address = ?, postcode = ?, interests = ?, pronouns = ?, dob = ? WHERE user_id = ?";
  db.query(
    editProfileQuery,
    [
      first_name,
      last_name,
      email,
      phone_number,
      address,
      postcode,
      interests,
      pronouns,
      dob,
      profile_id,
    ],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database Error" });
      }
      return res.status(200).json({ message: "Profile Updated Successfully" });
    }
  );
});

//Update the database on what data the user wants to share
router.post("/profile/share/", (req, res) => {
  const { profile_id, phone_private, address_private } = req.body;
  const editProfileQuery =
    "UPDATE members SET phone_private = ?, address_private = ? WHERE user_id = ?";
  db.query(
    editProfileQuery,
    [phone_private, address_private, profile_id],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database Error" });
      }
      return res.status(200).json({ message: "Profile Updated Successfully" });
    }
  );
});
router.get("/members", (req, res) => {
  const query = "SELECT * FROM members";
  db.query(query, (err, results) => {
    const user = results;
    res.json({ user });
  });
});


module.exports = router;