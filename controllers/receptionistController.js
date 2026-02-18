// Get dashboard
const db = require("../config/database");

exports.getDashboard = async (req, res) => {
  try {
    const clinicId = req.user.clinic_id;

    const [patients, todayAppts, upcomingAppts, pendingAppts] =
      await Promise.all([
        db.query(
          "SELECT COUNT(*) as total FROM users WHERE clinic_id = $1 AND role = 'patient' AND is_active = true",
          [clinicId],
        ),
        db.query(
          "SELECT COUNT(*) as total FROM appointments WHERE clinic_id = $1 AND appointment_date = CURRENT_DATE",
          [clinicId],
        ),
        db.query(
          "SELECT COUNT(*) as total FROM appointments WHERE clinic_id = $1 AND appointment_date > CURRENT_DATE AND status != 'cancelled'",
          [clinicId],
        ),
        db.query(
          "SELECT COUNT(*) as total FROM appointments WHERE clinic_id = $1 AND status = 'pending'",
          [clinicId],
        ),
      ]);

    res.json({
      success: true,
      data: {
        total_patients: parseInt(patients.rows[0].total),
        today_appointments: parseInt(todayAppts.rows[0].total),
        upcoming_appointments: parseInt(upcomingAppts.rows[0].total),
        pending_approvals: parseInt(pendingAppts.rows[0].total),
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create appointment
exports.createAppointment = async (req, res) => {
  try {
    const {
      patient_id,
      doctor_id,
      appointment_date,
      appointment_time,
      reason,
      duration_minutes,
    } = req.body;
    const clinicId = req.user.clinic_id;

    // Check for time slot conflict
    const conflict = await db.query(
      `SELECT id FROM appointments 
       WHERE doctor_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND status != 'cancelled'`,
      [doctor_id, appointment_date, appointment_time],
    );

    if (conflict.rows.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Time slot already booked" });
    }

    const result = await db.query(
      `INSERT INTO appointments (patient_id, doctor_id, receptionist_id, clinic_id, appointment_date, appointment_time, reason, duration_minutes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING *`,
      [
        patient_id,
        doctor_id,
        req.user.id,
        clinicId,
        appointment_date,
        appointment_time,
        reason,
        duration_minutes || 30,
      ],
    );

    // Create notification for doctor
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message, related_id)
       VALUES ($1, 'appointment', 'New Appointment Request', 'You have a new appointment request', $2)`,
      [doctor_id, result.rows[0].id],
    );

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create appointment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all appointments
exports.getAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "", date = "" } = req.query;
    const offset = (page - 1) * limit;
    const clinicId = req.user.clinic_id;

    let query = `
      SELECT a.*, 
             p.full_name as patient_name, p.phone as patient_phone,
             d.full_name as doctor_name, d.specialization
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN users d ON a.doctor_id = d.id
      WHERE a.clinic_id = $1
    `;
    const params = [clinicId];

    if (status) {
      query += ` AND a.status = $${params.length + 1}`;
      params.push(status);
    }

    if (date) {
      query += ` AND a.appointment_date = $${params.length + 1}`;
      params.push(date);
    }

    query += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get daily report
exports.getDailyReport = async (req, res) => {
  try {
    const { date = new Date().toISOString().split("T")[0] } = req.query;
    const clinicId = req.user.clinic_id;

    const [appointments, revenue] = await Promise.all([
      db.query(
        `SELECT a.*, p.full_name as patient_name, d.full_name as doctor_name
         FROM appointments a
         JOIN users p ON a.patient_id = p.id
         JOIN users d ON a.doctor_id = d.id
         WHERE a.clinic_id = $1 AND a.appointment_date = $2
         ORDER BY a.appointment_time`,
        [clinicId, date],
      ),
      db.query(
        `SELECT 
           COALESCE(SUM(tb.total_amount), 0) as treatment_revenue,
           (SELECT COALESCE(SUM(total_amount), 0) FROM medicine_bills WHERE clinic_id = $1 AND DATE(created_at) = $2 AND status = 'paid') as medicine_revenue
         FROM treatment_bills tb
         WHERE tb.clinic_id = $1 AND DATE(tb.created_at) = $2 AND tb.status = 'paid'`,
        [clinicId, date],
      ),
    ]);

    res.json({
      success: true,
      data: {
        date,
        appointments: appointments.rows,
        total_appointments: appointments.rows.length,
        revenue: {
          treatment: parseFloat(revenue.rows[0].treatment_revenue),
          medicine: parseFloat(revenue.rows[0].medicine_revenue),
          total:
            parseFloat(revenue.rows[0].treatment_revenue) +
            parseFloat(revenue.rows[0].medicine_revenue),
        },
      },
    });
  } catch (error) {
    console.error("Daily report error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
