require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dayjs = require("dayjs");
const dayjsRecur = require("dayjs-recur");

// Import configurations and routes
const { connectDB } = require("./config/database");
const limiter = require("./auth/rateLimit");
const authRoutes = require("./auth/tokens");
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
app.use("/users", userRoutes);
app.use("/profile", profileRoutes);
//app.use("/boardMemberAccess", boardRoutes);

//Board Member Access
app.get("/boardMemberAccess/:id", async (req, res) => {
  const id = req.params.id;
  const query = "SELECT level_of_access FROM board_members WHERE user_id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    res.json(result[0]);
  });
});


app.post("/user/guest", (req, res) => {
  const { user_id } = req.body;
  const ConstraintQuery =
    "UPDATE members SET guest=TRUE, paid=FALSE WHERE user_id = ?";
  db.query(ConstraintQuery, [user_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    return res.status(200).json({ message: "guest Updated Successfully" });
  });
});
app.post("/user/member", (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const { user_id } = req.body;
  const ConstraintQuery = `UPDATE members SET join_date=?, end_date=?, guest=FALSE, paid=TRUE WHERE user_id = ?`;
  db.query(ConstraintQuery, [today, "2025-06-30", user_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    return res.status(200).json({ message: "guest Updated Successfully" });
  });
});
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
app.get("/user/:id", (req, res) => {
  const userId = req.params.id;
  const query = "SELECT Club_id as club_id FROM `member's club` WHERE User_id = ?";

  db.query(query, [userId], (err, results) => {
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

app.get("/allClubs/", (req, res) => {
  const query = "SELECT club_id FROM club";

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
app.get("/club/:id", (req, res) => {
  const clubId = req.params.id;
  const query = "SELECT club_name FROM club WHERE club_id = ?";

  db.query(query, [clubId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(results[0]);
  });
});

app.get("/meeting/:id", (req, res) => {
  const clubId = req.params.id;
  const query = "SELECT * FROM meeting WHERE club_id = ?";

  db.query(query, [clubId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(201).json({ message: "No Meetings Found" });
    } else if (results.length > 0) {
      res.json(results);
    }
  });
});

app.get("/meeting_details/:id", (req, res) => {
  const meetingId = req.params.id;
  const query = "SELECT * FROM meeting WHERE meeting_id = ?";

  db.query(query, [meetingId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    res.json(results); // Send only the first (and only) result
  });
});

app.get("/club_details/:id", (req, res) => {
  const clubId = req.params.id;
  const query = "SELECT * FROM club WHERE Club_id = ?";

  db.query(query, [clubId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "CLub not found" });
    }

    res.json(results); // Send only the first (and only) result
  });
});

app.get("/clubAccess/:id", (req, res) => {
  const memberId = req.params.id;
  const query = "SELECT * FROM board_members WHERE user_id = ?";

  db.query(query, [memberId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(202).json({ message: "No Club Access" });
    }

    res.status(200).json(results[0]); // Send only the first (and only) result
  });
});

app.get("/clubBoard/:id", (req, res) => {
  const clubId = req.params.id;
  const query = "SELECT User_id FROM `member's club` WHERE Club_id = ?";

  db.query(query, [clubId], (err, results) => {
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
app.get("/notInClub/:id", (req, res) => {
  const clubId = req.params.id;
  const query =
    "select user_id from members where user_id not in (select User_id from `member's club` where Club_id = ?)";

  db.query(query, [clubId], (err, results) => {
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

app.get("/clubBoardMembers/:id", (req, res) => {
  const UserId = req.params.id;
  const query = "SELECT * FROM members WHERE user_id = ?";

  db.query(query, [UserId], (err, results) => {
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

app.get("/members", (req, res) => {
  const query = "SELECT * FROM members";
  db.query(query, (err, results) => {
    const user = results;
    res.json({ user });
  });
});

app.get("/club/:clubName", (req, res) => {
  const clubName = req.params.clubName;
  const query = "SELECT * FROM club WHERE Club_name = ?";

  db.query(query, [clubName], (err, results) => {
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

app.get("/clubs", (req, res) => {
  const query = "SELECT Club_id, Club_name FROM club";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Internal server error" });
    res.json(results);
  });
});
app.post("/send-message", async (req, res) => {
  const { senderId } = req.body;
  const query = "SELECT * FROM members WHERE user_id = ?";
  db.query(query, [senderId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }

    res.json(result);
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
app.get("/project/:id", (req, res) => {
  const projectlevel = req.params.id;
  const query = "SELECT * FROM `development program` WHERE project_level = ?";

  db.query(query, [projectlevel], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result);
  });
});
app.post("/projects/", (req, res) => {
  const { program_level, user_id } = req.body;
  const query =
    "SELECT * FROM development_program WHERE program_level = ? AND user_id = ? ORDER BY project_number ASC";

  db.query(query, [program_level, user_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result);
  });
});
app.get("/projectss/:id/:level", (req, res) => {
  const projectlevel = req.params.level;
  const projectid = req.params.id;
  const query =
    "SELECT * FROM `development program` WHERE member_id= ? AND project_level = ?";

  db.query(query, [projectid, projectlevel], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result);
  });
});
app.post("/user/enrol", async (req, res) => {
  const projectlevel = req.params.level;
});
app.post("/member/projects/1", async (req, res) => {
  const projectnames = [
    "Thoughts for the Day/Inspiration",
    "Closing Thought",
    "Issues of the Day",
    "Self-Introduction Speech\n4-7 minutes",
    "Oral Reading\n4-7 minutes",
    "Poetry Reading\n4-7 minutes",
    "Word Power Education\n10 minutes",
    "Speach to Inform\n5-8 minutes",
    "Speech Containing Gestures\n5-8 minutes",
    "Introduction of a Speaker",
    "Thanking a Speaker",
    "Trainee Evaluator",
    "Self=Evaluation",
  ];
  let { user_id, website_login, password } = req.body;
  console.log(user_id)
  for (const i = 0; i < projectnames.length; i++) {
    if (i == 2 || i == 11) {
      for (const j = 0; j < 3; j++) {
        const query =
          "INSERT INTO development_program (user_id, project_number, project_title, program_level) VALUES (?, ?, ?, ?)";
        db.query(query, [senderId, i, projectnames[i], 1], (err, result) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database Error" });
          }
          console.log(result)
          res.json(result);
        });
      }
    } else {
      const query =
        "INSERT INTO development_program (user_id, project_number, project_title, program_level) VALUES (?, ?, ?, ?)";
      db.query(query, [user_id, i, projectnames[i], 1], (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database Error" });
        }
        res.json(result);
      });
    }
  }
});
app.post("/member/projects/2", async (req, res) => {
  const projectnames = [
    "Issues of the day Leader",
    "Program Leader",
    "Speech to Persuade\n5-8 minutes",
    "Speech to inspire\n5-8 minutes",
    "Speech to Entertain\n5-8 minutes",
    "Research Speech\n5-8 minutes",
    "Current Event Speech\n5-8 minutes",
    "Speech Using Visual Aids\n5-8 minutes",
    "Impromptu Speech\n4-7 minutes",
    "Word Power Education\n20 minutes",
    "Assignment Evaluator",
    "General Evaluator\n8-10 minutes",
    "Committee Member",
  ];
  const { senderId } = req.body;
  for (const i = 0; i < projectnames.length; i++) {
    if (i == 10) {
      for (const j = 0; j < 3; j++) {
        const query =
          "INSERT INTO `development_program` (user_id, project_number, project_title, program_level) VALUES (?, ?, ?, ?)";
        db.query(query, [senderId, i, projectnames[i], 2], (err, result) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database Error" });
          }
          res.json(result);
        });
      }
    } else if (i == 1 || i == 12) {
      for (const j = 0; j < 2; j++) {
        const query =
          "INSERT INTO `development_program` (user_id, project_number, project_title, program_level) VALUES (?, ?, ?, ?)";
        db.query(query, [senderId, i, projectnames[i], 2], (err, result) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database Error" });
          }
          res.json(result);
        });
      }
    } else {
      const query =
        "INSERT INTO `development_program` (user_id, project_number, project_title, program_level) VALUES (?, ?, ?, ?)";
      db.query(query, [senderId, i, projectnames[i], 2], (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database Error" });
        }
        res.json(result);
      });
    }
  }
});
app.post("/member/projects/3", async (req, res) => {
  const projectnames = [
    "Prepare a Written Report and Present Using a Microphone",
    "Present an Education Session\n20-30 minutes",
    "Program a Meeting at any Level",
    "Moderator or Discussion Leader",
    "General Evaluator",
    "Committee Chairman",
    "Club Elected Officer",
    "POWERtalk Australia Conference Delegate",
    "Speech Contest Judge",
    "Plus any six of the following eight speeches:",
    "Speech Using a Whiteboard\n8-10 minutes",
    "Biographical Speech\n8-10 minutes",
    "Review Assignment 6-9 minutes",
    "Be in Earnest Speech 5-8 minutes",
    "TV Talk 6-8 minutes",
    "Speech to Inspire, Using Technology 5-8 minutes",
    "Travelogue 7-10 minutes",
    "	Impromptu Speech 7-8 minutes",
  ];
  const { senderId } = req.body;
  for (const i = 0; i < projectnames.length; i++) {
    if (i == 1 || i == 2 || i == 4 || i == 5 || i == 6) {
      for (const j = 0; j < 2; j++) {
        const query =
          "INSERT INTO `development_program` (user_id, project_number, project_title, program_level) VALUES (?, ?, ?, ?)";
        db.query(query, [senderId, i, projectnames[i], 3], (err, result) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database Error" });
          }
          res.json(result);
        });
      }
    } else {
      const query =
        "INSERT INTO `development_program` (user_id, project_number, project_title, program_level) VALUES (?, ?, ?, ?)";
      db.query(query, [senderId, i, projectnames[i], 3], (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database Error" });
        }
        res.json(result);
      });
    }
  }
});
app.post("/member/projects/3a", async (req, res) => {
  const projectnames = [
    "Art Exhibition Review (Time 6-9 minutes)",
    "	Concert Review (Time 6-9 minutes)",
    "Film Review (Time 6-9 minutes)",
    "Play/Theatre Review (Time 6-9 minutes)",
    "Book Review (Time 6-9 minutes)",
    "Book Report (Time 3-5 minutes)",
    "Impact Speech (Time 5-8 minutes)",
    "	Special Occasion Speech (Time as programmed)",
    "Occupational or personal interest speech (5-7 minutes)",
    "Speech contest speech (Time 5-8 minutes)",
    "Extemporaneous Speech (Time 5-7 minutes)",
    "Moderator of a Dialogue Evaluation (Time 20-30 minutes)",
    "Assignment using a microphone (Time as programmed)",
    "Assignment using a microphone (Time as programmed)",
  ];
  const { senderId } = req.body;
  for (const i = 0; i < projectnames.length; i++) {
    const query =
      "INSERT INTO `development_program` (user_id, project_number, project_title, program_level) VALUES (?, ?, ?, ?)";
    db.query(query, [senderId, i, projectnames[i], 3.1], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database Error" });
      }
      res.json(result);
    });
  }
});
app.post("/member/projects/4", async (req, res) => {
  const projectnames = [
    "Prepare and present an education session at any level",
    "Prepare and present an education session at any level",
    "Present at any level an education session developed by someone else",
    "Interpretive Reading",
    "Delivering a Presentation with PowerPoint",
    "Research Speech\n5-8 minutes",
    "Current Event Speech\n5-8 minutes",
    "Speech Using Visual Aids\n5-8 minutes",
    "Impromptu Speech\n4-7 minutes",
    "Word Power Education\n20 minutes",
    "Assignment Evaluator",
    "General Evaluator\n8-10 minutes",
    "Committee Member",
  ];
  const { senderId } = req.body;
  for (const i = 0; i < projectnames.length; i++) {
    if (i == 10) {
      for (const j = 0; j < 3; j++) {
        const query =
          "INSERT INTO `development_program` (user_id, project_number, project_title, program_level) VALUES (?, ?, ?, ?)";
        db.query(query, [senderId, i, projectnames[i], 4], (err, result) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database Error" });
          }
          res.json(result);
        });
      }
    } else if (i == 1 || i == 12) {
      for (const j = 0; j < 2; j++) {
        const query =
          "INSERT INTO `development_program` (user_id, project_number, project_title, program_level) VALUES (?, ?, ?, ?)";
        db.query(query, [senderId, i, projectnames[i], 4], (err, result) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database Error" });
          }
          res.json(result);
        });
      }
    } else {
      const query =
        "INSERT INTO `development_program` (user_id, project_number, project_title, program_level) VALUES (?, ?, ?, ?)";
      db.query(query, [senderId, i, projectnames[i], 4], (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database Error" });
        }
        res.json(result);
      });
    }
  }
});
app.post("/request-project", async (req, res) => {
  const { club_id, project_no } = req.body;
  const query =
    "INSERT INTO `program_requests` (project_id, club_id) VALUES (?, ?)";
  db.query(query, [project_no, club_id], (err, result) => {
    //need to change this to meeting
    console.log(club_id);
    console.log(project_no);
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    return res.status(200).json({ message: "New Request Successful" });
  });
});
app.post("/autofill-meetings", async (req, res) => {
  let nextDates = [];
  const club_data = await get_clubdates();
  console.log(club_data);
  for (var i = 0; i < club_data.length; i++) {
    club = club_data[i];
    console.log(club);
    const arr = club.interval.split(",");
    const days = arr.flatMap((el) => {
      if (typeof el == "string") {
        //converts string to int
        return el.split(",").map((n) => +n - 1); //-1 to align with dayjs counting 0 as 1st
      }
      return el;
    });
    const cal = dayjs
      .recur()
      .every(club.club_day)
      .daysOfWeek()
      .every(days)
      .weeksOfMonthByDay();
    const firstDayOfMonth = dayjs().startOf("month");
    cal.fromDate(firstDayOfMonth);
    const curr_month = dayjs().month();
    if (curr_month == 0 || curr_month == 10) {
      //if january or november
      nextmeetings = cal.next(1);
      for (var j = 0; j < 1; j++) {
        nextDates.push(nextmeetings[j].toDate());
        const meet_name = `${club.Club_name} Meeting ${j + 1}`;
        set_meetings(
          club.Club_id,
          meet_name,
          nextmeetings[j].toDate(),
          club.club_time,
          "placeholder"
        );
      }

      console.log(nextDates);
      const club_memb = await members_in_clubs(club.Club_id);

      console.log(club_memb);
      for (var j = 0; j < 1; j++) {
        mem = club_memb[j];
        for (var k = 0; k < days.length; k++) {
          console.log(nextmeetings[k].toDate());
          const alligned_meeting = await get_meetingids(
            club.Club_id,
            nextmeetings[k].toDate()
          );
          console.log(alligned_meeting);
          assign_all_to_meetings(mem.User_id, alligned_meeting[0].meeting_id);
        }
      }
    }
    if (curr_month == 11) {
      // If december
      //no meetings
      console.log("No meetings for this month");
      return;
    } else {
      nextmeetings = cal.next(days.length);
      for (var j = 0; j < days.length; j++) {
        nextDates.push(nextmeetings[j].toDate());
        const meet_name = `${club.Club_name} Meeting ${j + 1}`;
        set_meetings(
          club.Club_id,
          meet_name,
          nextmeetings[j].toDate(),
          club.club_time,
          "placeholder"
        );
      }

      console.log(nextDates);
      const club_memb = await members_in_clubs(club.Club_id);

      console.log(club_memb);
      for (var j = 0; j < club_memb.length; j++) {
        mem = club_memb[j];
        for (var k = 0; k < days.length; k++) {
          console.log(nextmeetings[k].toDate());
          const alligned_meeting = await get_meetingids(
            club.Club_id,
            nextmeetings[k].toDate()
          );
          console.log(alligned_meeting);
          assign_all_to_meetings(mem.User_id, alligned_meeting[0].meeting_id);
        }
      }
    }
  }
});
app.listen(+process.env.PORT, "0.0.0.0", () => {
  console.log(`Server running on port ` + process.env.PORT);
});

function get_clubdates() {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT Club_id, Club_name, club_day, `interval`, club_time  FROM `club`",
      (err, results, fields) => {
        if (!err) {
          resolve(results);
        } else {
          reject(err);
        }
      }
    );
  });
}

function set_meetings(
  clubid,
  meetingname,
  meetingdate,
  meetingtime,
  meetingplace
) {
  //CHANGE IN INDEX.js
  return new Promise((resolve, reject) => {
    query =
      "INSERT INTO `meeting` (club_id, meeting_name, meeting_date, meeting_time, meeting_place) VALUES (?, ?, ?, ?, ?)";
    db.query(
      query,
      [clubid, meetingname, meetingdate, meetingtime, meetingplace],
      (err, results, fields) => {
        if (!err) {
          //console.log(results);
          resolve(results);
        } else {
          reject(err);
        }
      }
    );
  });
}

function members_in_clubs(clubid) {
  //CHANGE IN INDEX.js
  return new Promise((resolve, reject) => {
    query = "SELECT User_id FROM `member's club` WHERE Club_id = ?";
    db.query(query, [clubid], (err, results, fields) => {
      if (!err) {
        //console.log(results);
        resolve(results);
      } else {
        reject(err);
      }
    });
  });
}

function get_meetingids(clubid, meetingdate) {
  //CHANGE IN INDEX.js
  return new Promise((resolve, reject) => {
    const formattedDate = meetingdate.toISOString().split("T")[0];
    query =
      "SELECT meeting_id FROM meeting WHERE club_id = ? and meeting_date = ?";
    db.query(query, [clubid, formattedDate], (err, results, fields) => {
      if (!err) {
        //console.log(`${results} + ${clubid} + ${meetingdate}`);
        resolve(results);
      } else {
        reject(err);
      }
    });
  });
}

function assign_all_to_meetings(user, meetingid) {
  //CHANGE IN INDEX.js
  return new Promise((resolve, reject) => {
    query =
      "INSERT INTO meeting_attendance (user_id, meeting_id) VALUES (?, ?)";
    db.query(query, [user, meetingid], (err, results, fields) => {
      if (!err) {
        console.log(results);
        resolve(results);
      } else {
        reject(err);
      }
    });
  });
}


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