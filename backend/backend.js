require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dayjs = require("dayjs");
const dayjsRecur = require("dayjs-recur");

// Import configurations and routes
const { connectDB } = require("./config/database");
const limiter = require("./middleware/rateLimit");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const profileRoutes = require("./routes/profile");
const boardRoutes = require("./routes/board");

// Initialize dayjs plugins
dayjs.extend(dayjsRecur);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(limiter);

// Routes
app.use("/users", authRoutes);
app.use("/users", userRoutes);
app.use("/profile", profileRoutes);
app.use("/boardMemberAccess", boardRoutes);

// Additional routes that don't fit categories
app.post("/user/guest", (req, res) => {
  const { user_id } = req.body;
  const { db } = require("./config/database");
  
  const ConstraintQuery = "UPDATE members SET guest=TRUE, paid=FALSE WHERE user_id = ?";
  db.query(ConstraintQuery, [user_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    return res.status(200).json({ message: "Guest status updated successfully" });
  });
});

app.post("/user/member", (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const { user_id } = req.body;
  const { db } = require("./config/database");
  
  const ConstraintQuery = "UPDATE members SET join_date=?, end_date=?, guest=FALSE, paid=TRUE WHERE user_id = ?";
  db.query(ConstraintQuery, [today, "2025-06-30", user_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    return res.status(200).json({ message: "Member status updated successfully" });
  });
});

// Start server
const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });

module.exports = app;