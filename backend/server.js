// Cafe Backend Server
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root123", // Assuming this from previous code
  database: "cafe_db",
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB ERROR:", err);
  } else {
    console.log("✅ MySQL Connected to cafe_db");
  }
});

// Nodemailer Setup (Ethereal Testing Account)
let transporter;
nodemailer.createTestAccount((err, account) => {
  if (err) {
    console.error('Failed to create a testing account. ' + err.message);
    return process.exit(1);
  }

  transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass
    }
  });
  console.log("✅ Nodemailer Ethereal Test Account Ready");
});

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend running successfully");
});

// GET AVAILABILITY
app.get("/availability", (req, res) => {
  const { space, date } = req.query;

  if (!space || !date) {
    return res.status(400).json({ error: "Missing space or date" });
  }

  const sql = `
    SELECT unit_id, start_time, end_time
    FROM bookings
    WHERE space = ? AND date = ?
  `;

  db.query(sql, [space, date], (err, result) => {
    if (err) {
      console.error("Availability error:", err);
      return res.status(500).json({ error: "Availability error" });
    }
    res.json(result);
  });
});

// GET ALL BOOKINGS
app.get("/bookings", (req, res) => {
  db.query("SELECT * FROM bookings ORDER BY id DESC", (err, result) => {
    if (err) {
      console.error("Error fetching bookings:", err);
      return res.status(500).json({ error: "Error fetching bookings" });
    }
    res.json(result);
  });
});

// POST BOOKING
app.post("/book", (req, res) => {
  const {
    name,
    space,
    date,
    start_time,
    end_time,
    food_total,
    space_amount,
    unit_id
  } = req.body;

  // Validation
  if (!name || !space || !date || !start_time || !end_time || !unit_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const f_total = food_total || 0;
  const s_amount = space_amount || 0;
  const total_amount = f_total + s_amount;

  // CHECK CONFLICT
  const checkSql = `
    SELECT * FROM bookings
    WHERE space = ? AND date = ? AND unit_id = ?
    AND (start_time < ? AND end_time > ?)
  `;

  db.query(
    checkSql,
    [space, date, unit_id, end_time, start_time],
    (err, existing) => {
      if (err) {
        console.error("Conflict check failed:", err);
        return res.status(500).json({ error: "Conflict check failed" });
      }

      if (existing.length > 0) {
        return res.status(400).json({ error: "Slot already booked" });
      }

      // INSERT BOOKING
      const insertSql = `
        INSERT INTO bookings
        (name, space, date, unit_id, start_time, end_time, total_amount, food_total, space_amount, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'BOOKED')
      `;

      db.query(
        insertSql,
        [name, space, date, unit_id, start_time, end_time, total_amount, f_total, s_amount],
        (err, result) => {
          if (err) {
            console.error("❌ INSERT ERROR:", err);
            return res.status(500).json({ error: "Insert failed" });
          }

          console.log("✅ Booking Saved");

          // Send Confirmation Email
          if (transporter) {
            let mailOptions = {
              from: '"Seven Beans Cafe" <noreply@sevenbeans.com>',
              to: name, // The email is stored in the 'name' field
              subject: 'Booking Confirmation - Seven Beans',
              text: `Hello, your booking for ${space} on ${date} from ${start_time}:00 to ${end_time}:00 is confirmed. Total amount: ₹${total_amount}.`
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                return console.log("Error sending email:", error);
              }
              console.log('Confirmation Email Sent!');
              console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            });
          }

          res.json({
            message: "Booking successful",
            id: result.insertId,
            total_amount
          });
        }
      );
    }
  );
});

// DELETE BOOKING (Cancellation)
app.delete("/booking/:id", (req, res) => {
  const { id } = req.params;

  // 1. Fetch the booking to get amounts and email
  db.query("SELECT * FROM bookings WHERE id = ?", [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const booking = results[0];
    const s_amount = booking.space_amount || 0;

    // 2. Calculate Refund (70% of space amount)
    const refund = Math.round(s_amount * 0.70);

    // 3. Delete the booking
    db.query("DELETE FROM bookings WHERE id = ?", [id], (err, result) => {
      if (err) {
        console.error("Delete error:", err);
        return res.status(500).json({ error: "Delete failed" });
      }

      // 4. Send Cancellation Email
      if (transporter) {
        let mailOptions = {
          from: '"Seven Beans Cafe" <noreply@sevenbeans.com>',
          to: booking.name,
          subject: 'Booking Cancellation - Seven Beans',
          text: `Your booking for ${booking.space} on ${booking.date} has been cancelled. As per our policy, you will receive a refund of ₹${refund}. (Food is non-refundable).`
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log("Error sending cancellation email:", error);
          }
          console.log('Cancellation Email Sent!');
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
      }

      res.json({ message: `Booking cancelled successfully! You will be refunded ₹${refund}.` });
    });
  });
});

// START SERVER
const PORT = 5000;
app.listen(PORT, () => {
});
// Save me!
