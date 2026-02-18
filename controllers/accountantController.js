const db = require("../config/database");

// Get dashboard
exports.getDashboard = async (req, res) => {
  try {
    const clinicId = req.user.clinic_id;

    const [
      todayRevenue,
      weekRevenue,
      monthRevenue,
      billsGenerated,
      pendingPayments,
    ] = await Promise.all([
      db.query(
        `SELECT 
           COALESCE(SUM(total_amount), 0) as treatment,
           (SELECT COALESCE(SUM(total_amount), 0) FROM medicine_bills WHERE clinic_id = $1 AND DATE(created_at) = CURRENT_DATE AND status = 'paid') as medicine
         FROM treatment_bills 
         WHERE clinic_id = $1 AND DATE(created_at) = CURRENT_DATE AND status = 'paid'`,
        [clinicId],
      ),
      db.query(
        `SELECT 
           COALESCE(SUM(total_amount), 0) as treatment,
           (SELECT COALESCE(SUM(total_amount), 0) FROM medicine_bills WHERE clinic_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '7 days' AND status = 'paid') as medicine
         FROM treatment_bills 
         WHERE clinic_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '7 days' AND status = 'paid'`,
        [clinicId],
      ),
      db.query(
        `SELECT 
           COALESCE(SUM(total_amount), 0) as treatment,
           (SELECT COALESCE(SUM(total_amount), 0) FROM medicine_bills WHERE clinic_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '30 days' AND status = 'paid') as medicine
         FROM treatment_bills 
         WHERE clinic_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '30 days' AND status = 'paid'`,
        [clinicId],
      ),
      db.query(
        "SELECT COUNT(*) as total FROM treatment_bills WHERE clinic_id = $1",
        [clinicId],
      ),
      db.query(
        `SELECT COUNT(*) as total FROM treatment_bills WHERE clinic_id = $1 AND status = 'pending'
         UNION ALL
         SELECT COUNT(*) as total FROM medicine_bills WHERE clinic_id = $1 AND status = 'pending'`,
        [clinicId],
      ),
    ]);

    const todayTotal =
      parseFloat(todayRevenue.rows[0].treatment) +
      parseFloat(todayRevenue.rows[0].medicine);
    const weekTotal =
      parseFloat(weekRevenue.rows[0].treatment) +
      parseFloat(weekRevenue.rows[0].medicine);
    const monthTotal =
      parseFloat(monthRevenue.rows[0].treatment) +
      parseFloat(monthRevenue.rows[0].medicine);
    const pendingTotal = pendingPayments.rows.reduce(
      (sum, row) => sum + parseInt(row.total),
      0,
    );

    res.json({
      success: true,
      data: {
        today_revenue: todayTotal,
        week_revenue: weekTotal,
        month_revenue: monthTotal,
        bills_generated: parseInt(billsGenerated.rows[0].total),
        pending_payments: pendingTotal,
        revenue_breakdown: {
          treatment: parseFloat(monthRevenue.rows[0].treatment),
          medicine: parseFloat(monthRevenue.rows[0].medicine),
        },
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create treatment bill
exports.createTreatmentBill = async (req, res) => {
  try {
    const { patient_id, appointment_id, total_amount, description } = req.body;
    const clinicId = req.user.clinic_id;
    const accountantId = req.user.id;

    // Generate bill number
    const billNumber = `TRT-${Date.now()}`;

    const result = await db.query(
      `INSERT INTO treatment_bills (patient_id, appointment_id, clinic_id, accountant_id, bill_number, total_amount, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING *`,
      [
        patient_id,
        appointment_id,
        clinicId,
        accountantId,
        billNumber,
        total_amount,
        description,
      ],
    );

    // Notify patient
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message, related_id)
       VALUES ($1, 'bill', 'New Treatment Bill', 'A new treatment bill has been generated', $2)`,
      [patient_id, result.rows[0].id],
    );

    res.status(201).json({
      success: true,
      message: "Treatment bill created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create bill error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all treatment bills
exports.getTreatmentBills = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "" } = req.query;
    const offset = (page - 1) * limit;
    const clinicId = req.user.clinic_id;

    let query = `
      SELECT tb.*, p.full_name as patient_name, p.phone as patient_phone
      FROM treatment_bills tb
      JOIN users p ON tb.patient_id = p.id
      WHERE tb.clinic_id = $1
    `;
    const params = [clinicId];

    if (status) {
      query += ` AND tb.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY tb.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get bills error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update bill payment
exports.updateBillPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paid_amount, status } = req.body;
    const clinicId = req.user.clinic_id;

    const result = await db.query(
      `UPDATE treatment_bills 
       SET paid_amount = COALESCE($1, paid_amount),
           status = COALESCE($2, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND clinic_id = $4
       RETURNING *`,
      [paid_amount, status, id, clinicId],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Bill not found" });
    }

    res.json({
      success: true,
      message: "Bill updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update bill error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get revenue report
exports.getRevenueReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const clinicId = req.user.clinic_id;

    const result = await db.query(
      `SELECT 
         DATE(created_at) as date,
         COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as revenue,
         COUNT(*) as total_bills,
         COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_bills,
         COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bills
       FROM treatment_bills
       WHERE clinic_id = $1 AND DATE(created_at) BETWEEN $2 AND $3
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [clinicId, start_date, end_date],
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Revenue report error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
