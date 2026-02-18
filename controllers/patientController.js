const db = require("../config/database");

// Get dashboard
exports.getDashboard = async (req, res) => {
  try {
    const patientId = req.user?.id;

    // Check authentication
    if (!patientId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const [upcomingAppts, recentReports, recentBills] = await Promise.all([
      // Upcoming appointments
      db.query(
        `SELECT a.*, d.full_name as doctor_name, d.specialization, c.name as clinic_name
         FROM appointments a
         JOIN users d ON a.doctor_id = d.id
         JOIN clinics c ON a.clinic_id = c.id
         WHERE a.patient_id = $1 
         AND a.appointment_date >= CURRENT_DATE
         AND a.status != 'cancelled'
         ORDER BY a.appointment_date, a.appointment_time
         LIMIT 5`,
        [patientId],
      ),

      // Recent lab reports
      db.query(
        `SELECT lr.*, lt.test_name, lt.test_type
         FROM lab_reports lr
         JOIN lab_tests lt ON lr.lab_test_id = lt.id
         WHERE lt.patient_id = $1
         ORDER BY lr.uploaded_at DESC
         LIMIT 5`,
        [patientId],
      ),

      // Recent bills - FIXED: Using correct column names from schema
      db.query(
        `SELECT 
          id, 
          patient_id, 
          clinic_id,
          bill_number,
          total_amount,
          paid_amount,
          status,
          created_at,
          'treatment' as bill_type
         FROM treatment_bills
         WHERE patient_id = $1
         UNION ALL
         SELECT 
          id, 
          patient_id, 
          clinic_id,
          bill_number,
          total_amount,
          paid_amount,
          status,
          created_at,
          'medicine' as bill_type
         FROM medicine_bills
         WHERE patient_id = $1
         ORDER BY created_at DESC
         LIMIT 5`,
        [patientId],
      ),
    ]);

    res.json({
      success: true,
      data: {
        upcoming_appointments: upcomingAppts.rows || [],
        recent_lab_reports: recentReports.rows || [],
        recent_bills: recentBills.rows || [],
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    console.error("Error stack:", error.stack);
    console.error("Patient ID:", req.user?.id);

    res.status(500).json({
      success: false,
      message: "Server error",
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
        details: error.stack,
      }),
    });
  }
};

// Get appointments
exports.getAppointments = async (req, res) => {
  try {
    const patientId = req.user?.id;

    if (!patientId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT a.*, 
              d.full_name as doctor_name, 
              d.specialization,
              d.phone as doctor_phone,
              c.name as clinic_name,
              c.address as clinic_address
       FROM appointments a
       JOIN users d ON a.doctor_id = d.id
       JOIN clinics c ON a.clinic_id = c.id
       WHERE a.patient_id = $1
       ORDER BY a.appointment_date DESC, a.appointment_time DESC
       LIMIT $2 OFFSET $3`,
      [patientId, limit, offset],
    );

    res.json({
      success: true,
      data: result.rows || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rowCount,
      },
    });
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};

// Get lab reports
exports.getLabReports = async (req, res) => {
  try {
    const patientId = req.user?.id;

    if (!patientId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT lr.*, 
              lt.test_name, 
              lt.test_type, 
              lt.description,
              u.full_name as technician_name,
              d.full_name as doctor_name
       FROM lab_reports lr
       JOIN lab_tests lt ON lr.lab_test_id = lt.id
       LEFT JOIN users u ON lr.lab_technician_id = u.id
       LEFT JOIN users d ON lt.doctor_id = d.id
       WHERE lt.patient_id = $1
       ORDER BY lr.uploaded_at DESC
       LIMIT $2 OFFSET $3`,
      [patientId, limit, offset],
    );

    res.json({
      success: true,
      data: result.rows || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rowCount,
      },
    });
  } catch (error) {
    console.error("Get lab reports error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};

// Get treatment bills
exports.getTreatmentBills = async (req, res) => {
  try {
    const patientId = req.user?.id;

    if (!patientId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT tb.*, 
              c.name as clinic_name, 
              u.full_name as accountant_name
       FROM treatment_bills tb
       JOIN clinics c ON tb.clinic_id = c.id
       LEFT JOIN users u ON tb.accountant_id = u.id
       WHERE tb.patient_id = $1
       ORDER BY tb.created_at DESC
       LIMIT $2 OFFSET $3`,
      [patientId, limit, offset],
    );

    res.json({
      success: true,
      data: result.rows || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rowCount,
      },
    });
  } catch (error) {
    console.error("Get treatment bills error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};

// Get medicine bills
exports.getMedicineBills = async (req, res) => {
  try {
    const patientId = req.user?.id;

    if (!patientId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT mb.*, 
              c.name as clinic_name, 
              u.full_name as pharmacist_name
       FROM medicine_bills mb
       JOIN clinics c ON mb.clinic_id = c.id
       LEFT JOIN users u ON mb.pharmacist_id = u.id
       WHERE mb.patient_id = $1
       ORDER BY mb.created_at DESC
       LIMIT $2 OFFSET $3`,
      [patientId, limit, offset],
    );

    res.json({
      success: true,
      data: result.rows || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rowCount,
      },
    });
  } catch (error) {
    console.error("Get medicine bills error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};

// Get medicine bill items
exports.getMedicineBillItems = async (req, res) => {
  try {
    const { billId } = req.params;
    const patientId = req.user?.id;

    if (!patientId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Verify bill belongs to patient
    const billCheck = await db.query(
      "SELECT id FROM medicine_bills WHERE id = $1 AND patient_id = $2",
      [billId, patientId],
    );

    if (billCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    const result = await db.query(
      `SELECT mbi.*, 
              m.name as medicine_name, 
              m.generic_name
       FROM medicine_bill_items mbi
       JOIN medicines m ON mbi.medicine_id = m.id
       WHERE mbi.medicine_bill_id = $1`,
      [billId],
    );

    res.json({
      success: true,
      data: result.rows || [],
    });
  } catch (error) {
    console.error("Get bill items error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};

// Get medical history
exports.getMedicalHistory = async (req, res) => {
  try {
    const patientId = req.user?.id;

    if (!patientId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const [appointments, labReports, bills] = await Promise.all([
      db.query(
        `SELECT a.*, 
                d.full_name as doctor_name, 
                c.name as clinic_name
         FROM appointments a
         JOIN users d ON a.doctor_id = d.id
         JOIN clinics c ON a.clinic_id = c.id
         WHERE a.patient_id = $1 
         AND a.status = 'completed'
         ORDER BY a.appointment_date DESC`,
        [patientId],
      ),
      db.query(
        `SELECT lr.*, 
                lt.test_name, 
                lt.test_type
         FROM lab_reports lr
         JOIN lab_tests lt ON lr.lab_test_id = lt.id
         WHERE lt.patient_id = $1
         ORDER BY lr.uploaded_at DESC`,
        [patientId],
      ),
      db.query(
        `SELECT * FROM treatment_bills 
         WHERE patient_id = $1 
         ORDER BY created_at DESC`,
        [patientId],
      ),
    ]);

    res.json({
      success: true,
      data: {
        appointments: appointments.rows || [],
        lab_reports: labReports.rows || [],
        treatment_bills: bills.rows || [],
      },
    });
  } catch (error) {
    console.error("Get medical history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};
