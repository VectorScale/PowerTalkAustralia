const express = require("express");
const { db } = require("../config/database");

const router = express.Router();

router.get("/meeting/:id", (req, res) => {
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
router.post("/users/meeting/enrol/:id", async (req, res) => {
  const meetingid = req.params.id;
  const {userId} = req.body;
  query =
    `
    INSERT INTO meeting_attendance (user_id, meeting_id)
    VALUES (?,?)
    `
    db.query(query, [userId, meetingid], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    return res.status(200).json({ message: "Meeting Enrolled" });
  });
});
router.get("/meeting_details/:id", (req, res) => {
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
router.post("/autofill-meetings", async (req, res) => {
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





module.exports = router;

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