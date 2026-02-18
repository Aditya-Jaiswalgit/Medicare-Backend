const db = require('../config/database');

// Get dashboard
exports.getDashboard = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const [todayAppts, upcomingAppts, pendingAppts, visitHistory] = await Promise.all([
      db.query("SELECT COUNT(*) as total FROM appointments WHERE doctor_id = $1 AND appointment_date = CURRENT_DATE AND status != 'cancelled'", [doctorId]),
      db.query("SELECT COUNT(*) as total FROM appointments WHERE doctor_id = $1 AND appointment_date > CURRENT_DATE AND status != 'cancelled'", [doctorId]),
      db.query("SELECT COUNT(*) as total FROM appointments WHERE doctor_id = $1 AND status = 'pending'", [doctorId]),
      db.query("SELECT COUNT(*) as total FROM appointments WHERE doctor_id = $1 AND status = 'completed'", [doctorId])
    ]);

    res.json({
      success: true,
      data: {
        today_appointments: parseInt(todayAppts.rows[0].total),
        upcoming_appointments: parseInt(upcomingAppts.rows[0].total),
        pending_requests: parseInt(pendingAppts.rows[0].total),
        total_visits: parseInt(visitHistory.rows[0].total)
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get appointments
exports.getAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', date = '' } = req.query;
    const offset = (page - 1) * limit;
    const doctorId = req.user.id;

    let query = `
      SELECT a.*, 
             p.full_name as patient_name, p.phone as patient_phone, p.email as patient_email
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      WHERE a.doctor_id = $1
    `;
    const params = [doctorId];

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
      data: result.rows
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Approve/Reject appointment
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const doctorId = req.user.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const result = await db.query(
      `UPDATE appointments 
       SET status = $1, notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND doctor_id = $4
       RETURNING *`,
      [status, notes, id, doctorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Notify patient
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message, related_id)
       VALUES ($1, 'appointment', 'Appointment ${status}', 'Your appointment has been ${status}', $2)`,
      [result.rows[0].patient_id, id]
    );

    res.json({
      success: true,
      message: `Appointment ${status} successfully`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get patient details
exports.getPatientDetails = async (req, res) => {
  try {
    const { patientId } = req.params;

    const result = await db.query(
      `SELECT u.*, pd.date_of_birth, pd.blood_group, pd.emergency_contact, pd.medical_history, pd.allergies
       FROM users u
       LEFT JOIN patient_details pd ON u.id = pd.user_id
       WHERE u.id = $1 AND u.role = 'patient'`,
      [patientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    delete result.rows[0].password;

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get patient lab reports
exports.getPatientLabReports = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user.id;

    const result = await db.query(
      `SELECT lr.*, lt.test_name, lt.test_type, lt.description, u.full_name as technician_name
       FROM lab_reports lr
       JOIN lab_tests lt ON lr.lab_test_id = lt.id
       LEFT JOIN users u ON lr.lab_technician_id = u.id
       WHERE lt.patient_id = $1 AND lt.doctor_id = $2
       ORDER BY lr.uploaded_at DESC`,
      [patientId, doctorId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get lab reports error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
