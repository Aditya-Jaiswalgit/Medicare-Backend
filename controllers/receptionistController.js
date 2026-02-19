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

// Add these functions to existing receptionistController.js

// Get all patients
exports.getPatients = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      gender = "",
      blood_group = "",
    } = req.query;
    const offset = (page - 1) * limit;
    const clinicId = req.user.clinic_id;

    let query = `
      SELECT u.id, u.email, u.full_name, u.phone, u.address, u.is_active, u.created_at,
             pd.date_of_birth, pd.blood_group, pd.emergency_contact, pd.medical_history, pd.allergies,
             (SELECT COUNT(*) FROM appointments WHERE patient_id = u.id AND status = 'completed') as total_visits,
             (SELECT MAX(appointment_date) FROM appointments WHERE patient_id = u.id AND status = 'completed') as last_visit
      FROM users u
      LEFT JOIN patient_details pd ON u.id = pd.user_id
      WHERE u.clinic_id = $1 AND u.role = 'patient'
    `;
    const params = [clinicId];

    if (search) {
      query += ` AND (u.full_name ILIKE $${params.length + 1} OR u.email ILIKE $${params.length + 1} OR u.phone ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    if (status) {
      const isActive = status === "Active";
      query += ` AND u.is_active = $${params.length + 1}`;
      params.push(isActive);
    }

    if (blood_group) {
      query += ` AND pd.blood_group = $${params.length + 1}`;
      params.push(blood_group);
    }

    // Get total count
    const countQuery = query.replace(
      "SELECT u.id, u.email, u.full_name, u.phone, u.address, u.is_active, u.created_at, pd.date_of_birth, pd.blood_group, pd.emergency_contact, pd.medical_history, pd.allergies, (SELECT COUNT(*) FROM appointments WHERE patient_id = u.id AND status = 'completed') as total_visits, (SELECT MAX(appointment_date) FROM appointments WHERE patient_id = u.id AND status = 'completed') as last_visit",
      "SELECT COUNT(*)",
    );
    const countResult = await db.query(countQuery, params);

    query += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countResult.rows[0].count / limit),
      },
    });
  } catch (error) {
    console.error("Get patients error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get patient by ID
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinic_id;

    const result = await db.query(
      `SELECT u.*, pd.date_of_birth, pd.blood_group, pd.emergency_contact, pd.medical_history, pd.allergies,
              (SELECT COUNT(*) FROM appointments WHERE patient_id = u.id AND status = 'completed') as total_visits,
              (SELECT MAX(appointment_date) FROM appointments WHERE patient_id = u.id AND status = 'completed') as last_visit
       FROM users u
       LEFT JOIN patient_details pd ON u.id = pd.user_id
       WHERE u.id = $1 AND u.clinic_id = $2 AND u.role = 'patient'`,
      [id, clinicId],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    delete result.rows[0].password;

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Get patient error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update patient
exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      full_name,
      phone,
      address,
      date_of_birth,
      blood_group,
      emergency_contact,
      allergies,
      medical_history,
    } = req.body;
    const clinicId = req.user.clinic_id;

    // Update user table
    const userResult = await db.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           address = COALESCE($3, address),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND clinic_id = $5 AND role = 'patient'
       RETURNING *`,
      [full_name, phone, address, id, clinicId],
    );

    if (userResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    // Update patient_details table
    await db.query(
      `UPDATE patient_details 
       SET date_of_birth = COALESCE($1, date_of_birth),
           blood_group = COALESCE($2, blood_group),
           emergency_contact = COALESCE($3, emergency_contact),
           allergies = COALESCE($4, allergies),
           medical_history = COALESCE($5, medical_history),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $6`,
      [
        date_of_birth,
        blood_group,
        emergency_contact,
        allergies,
        medical_history,
        id,
      ],
    );

    res.json({
      success: true,
      message: "Patient updated successfully",
      data: userResult.rows[0],
    });
  } catch (error) {
    console.error("Update patient error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
