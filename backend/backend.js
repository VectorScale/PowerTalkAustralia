require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dayjs = require("dayjs");
const dayjsRecur = require("dayjs-recur");

// Import configurations and routes
const { db, connect } = require("./config/database");
const { authenticateToken, requireRole, limiter } = require("./config/auth");
 
const userRoutes = require("./routes/users");
const boardRoutes = require("./routes/board");
const projectRoutes = require("./routes/projects");
const meetingRoutes = require("./routes/meeting");
const clubRoutes = require("./routes/clubs");

// Initialize dayjs plugins
dayjs.extend(dayjsRecur);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(limiter);

// Routes
//app.use("/users", authRoutes);
app.use("/", userRoutes);
app.use("/", projectRoutes);
app.use("/", meetingRoutes);
app.use("/", boardRoutes);
app.use("/", clubRoutes);

app.post("/users/verify-token", authenticateToken, (req, res) => {
  console.log("ran")
  res.json({ 
    valid: true, 
    user: req.user,
    message: "Token is valid" 
  });
});


// Additional routes that aren't sorted yet
app.get("/member/:id", (req, res) => {
  const userId = req.params.id;
  const query = "SELECT * FROM `members` WHERE User_id = ?";

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(201).json({ message: "User not found" });
    }

    res.status(200).json(results[0]);
  });
});


app.get("/allGuests/", (req, res) => {
  const query = "SELECT user_id FROM members WHERE guest = 1";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(results);
  });
});

//Despite being called board member, this route is used to assign a member to a club
app.post("/BoardMember", (req, res) => {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();

  var join_date = yyyy + "-" + mm + "-" + dd;

  const { User_id, Club_id } = req.body;
  const query =
    "INSERT INTO `member's club` (User_id, Club_id, join_date) VALUES (?, ?, ?)";
  db.query(query, [User_id, Club_id, join_date], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    return res.status(200).json({ message: "New Member Added Successfully" });
  });
});

//Update payment info for a user
app.post("/updatePayment", requireRole('club') ,(req, res) => {
  const { user_id, paid, paid_date, guest } = req.body;
  const query =
    "UPDATE members SET paid = ?, paid_date = ?, guest = ? WHERE user_id = ?";
  db.query(query, [paid, paid_date, guest, user_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    return res.status(200).json({ message: "Payment Updated Successfully" });
  });
});


app.post("/send-messages", async (req, res) => {
  const { senderId } = req.body;
  const query = "SELECT * FROM boardmember WHERE member_id = ?";
  db.query(query, [senderId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    res.json(result);
  });
});


// Start server
app.listen(+process.env.PORT, "0.0.0.0", () => {
  console.log(`Server running on port ` + process.env.PORT);
});

connect()

module.exports = app;