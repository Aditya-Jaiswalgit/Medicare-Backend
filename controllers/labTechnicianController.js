const db = require("../config/database");

// Get dashboard
exports.getDashboard = async (req, res) => {
  try {
    const clinicId = req.user.clinic_id;

    const [pendingTests, completedToday, completedWeek, totalUploaded] =
      await Promise.all([
        db.query(
          "SELECT COUNT(*) as total FROM lab_tests WHERE clinic_id = $1 AND status = 'pending'",
          [clinicId],
        ),
        db.query(
          `SELECT COUNT(*) as total 
         FROM lab_reports lr
         JOIN lab_tests lt ON lr.lab_test_id = lt.id
         WHERE lt.clinic_id = $1 AND DATE(lr.uploaded_at) = CURRENT_DATE`,
          [clinicId],
        ),
        db.query(
          `SELECT COUNT(*) as total 
         FROM lab_reports lr
         JOIN lab_tests lt ON lr.lab_test_id = lt.id
         WHERE lt.clinic_id = $1 AND lr.uploaded_at >= CURRENT_DATE - INTERVAL '7 days'`,
          [clinicId],
        ),
        db.query(
          `SELECT COUNT(*) as total 
         FROM lab_reports lr
         JOIN lab_tests lt ON lr.lab_test_id = lt.id
         WHERE lt.clinic_id = $1`,
          [clinicId],
        ),
      ]);

    res.json({
      success: true,
      data: {
        pending_tests: parseInt(pendingTests.rows[0].total),
        completed_today: parseInt(completedToday.rows[0].total),
        completed_week: parseInt(completedWeek.rows[0].total),
        total_uploaded: parseInt(totalUploaded.rows[0].total),
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get lab tests
exports.getLabTests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "" } = req.query;
    const offset = (page - 1) * limit;
    const clinicId = req.user.clinic_id;

    let query = `
      SELECT lt.*, 
             p.full_name as patient_name, p.phone as patient_phone,
             d.full_name as doctor_name,
             (SELECT COUNT(*) FROM lab_reports WHERE lab_test_id = lt.id) as reports_count
      FROM lab_tests lt
      JOIN users p ON lt.patient_id = p.id
      LEFT JOIN users d ON lt.doctor_id = d.id
      WHERE lt.clinic_id = $1
    `;
    const params = [clinicId];

    if (status) {
      query += ` AND lt.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY lt.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get lab tests error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Upload lab report
exports.uploadLabReport = async (req, res) => {
  try {
    const { lab_test_id, report_file_url, report_data, remarks } = req.body;
    const technicianId = req.user.id;

    // Verify test exists and belongs to clinic
    const testCheck = await db.query(
      "SELECT lt.*, p.id as patient_id, d.id as doctor_id FROM lab_tests lt JOIN users p ON lt.patient_id = p.id LEFT JOIN users d ON lt.doctor_id = d.id WHERE lt.id = $1 AND lt.clinic_id = $2",
      [lab_test_id, req.user.clinic_id],
    );

    if (testCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Lab test not found" });
    }

    const test = testCheck.rows[0];

    // Create report
    const result = await db.query(
      `INSERT INTO lab_reports (lab_test_id, lab_technician_id, report_file_url, report_data, remarks)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        lab_test_id,
        technicianId,
        report_file_url,
        JSON.stringify(report_data),
        remarks,
      ],
    );

    // Update test status
    await db.query(
      "UPDATE lab_tests SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [lab_test_id],
    );

    // Notify patient
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message, related_id)
       VALUES ($1, 'lab_report', 'Lab Report Ready', 'Your lab report has been uploaded', $2)`,
      [test.patient_id, result.rows[0].id],
    );

    // Notify doctor if exists
    if (test.doctor_id) {
      await db.query(
        `INSERT INTO notifications (user_id, type, title, message, related_id)
         VALUES ($1, 'lab_report', 'Lab Report Available', 'A lab report has been uploaded', $2)`,
        [test.doctor_id, result.rows[0].id],
      );
    }

    res.status(201).json({
      success: true,
      message: "Lab report uploaded successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Upload report error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get lab reports
exports.getLabReports = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const clinicId = req.user.clinic_id;

    const result = await db.query(
      `SELECT lr.*, lt.test_name, lt.test_type,
              p.full_name as patient_name,
              u.full_name as technician_name
       FROM lab_reports lr
       JOIN lab_tests lt ON lr.lab_test_id = lt.id
       JOIN users p ON lt.patient_id = p.id
       LEFT JOIN users u ON lr.lab_technician_id = u.id
       WHERE lt.clinic_id = $1
       ORDER BY lr.uploaded_at DESC
       LIMIT $2 OFFSET $3`,
      [clinicId, limit, offset],
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
