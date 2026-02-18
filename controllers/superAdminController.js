const bcrypt = require("bcrypt");
const db = require("../config/database");

// Get dashboard stats
exports.getDashboard = async (req, res) => {
  try {
    // Total clinics
    const clinicsResult = await db.query(
      "SELECT COUNT(*) as total FROM clinics WHERE is_active = true",
    );

    // Total clinic admins
    const adminsResult = await db.query(
      "SELECT COUNT(*) as total FROM users WHERE role = 'clinic_admin' AND is_active = true",
    );

    // Recently added clinics
    const recentClinicsResult = await db.query(
      `SELECT id, name, address, phone, email, created_at 
       FROM clinics 
       WHERE is_active = true 
       ORDER BY created_at DESC 
       LIMIT 5`,
    );

    // System activity summary
    const activityResult = await db.query(
      `SELECT 
        COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today_activities,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as week_activities,
        COUNT(*) as total_activities
       FROM audit_logs`,
    );

    res.json({
      success: true,
      data: {
        total_clinics: parseInt(clinicsResult.rows[0].total),
        total_clinic_admins: parseInt(adminsResult.rows[0].total),
        recent_clinics: recentClinicsResult.rows,
        activity_summary: activityResult.rows[0],
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get all clinics
exports.getAllClinics = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*, 
             (SELECT COUNT(*) FROM users WHERE clinic_id = c.id AND role = 'clinic_admin') as admin_count
      FROM clinics c
      WHERE c.is_active = true
    `;

    const params = [];

    if (search) {
      query += ` AND (c.name ILIKE $1 OR c.email ILIKE $1)`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY c.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = "SELECT COUNT(*) FROM clinics WHERE is_active = true";
    const countParams = [];

    if (search) {
      countQuery += " AND (name ILIKE $1 OR email ILIKE $1)";
      countParams.push(`%${search}%`);
    }

    const countResult = await db.query(countQuery, countParams);

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
    console.error("Get clinics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Create clinic
exports.createClinic = async (req, res) => {
  try {
    const { name, address, phone, email } = req.body;

    const result = await db.query(
      `INSERT INTO clinics (name, address, phone, email)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, address, phone, email],
    );

    res.status(201).json({
      success: true,
      message: "Clinic created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create clinic error:", error);

    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Clinic with this email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update clinic
exports.updateClinic = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, email } = req.body;

    const result = await db.query(
      `UPDATE clinics 
       SET name = COALESCE($1, name),
           address = COALESCE($2, address),
           phone = COALESCE($3, phone),
           email = COALESCE($4, email),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND is_active = true
       RETURNING *`,
      [name, address, phone, email, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    res.json({
      success: true,
      message: "Clinic updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update clinic error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Delete clinic (soft delete)
exports.deleteClinic = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "UPDATE clinics SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    res.json({
      success: true,
      message: "Clinic deleted successfully",
    });
  } catch (error) {
    console.error("Delete clinic error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get all clinic admins
exports.getAllClinicAdmins = async (req, res) => {
  try {
    const { page = 1, limit = 10, clinic_id = "" } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT u.*, c.name as clinic_name
      FROM users u
      LEFT JOIN clinics c ON u.clinic_id = c.id
      WHERE u.role = 'clinic_admin' AND u.is_active = true
    `;

    const params = [];

    if (clinic_id) {
      query += ` AND u.clinic_id = $1`;
      params.push(clinic_id);
    }

    query += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Remove passwords
    result.rows.forEach((user) => delete user.password);

    // Get total count
    let countQuery =
      "SELECT COUNT(*) FROM users WHERE role = 'clinic_admin' AND is_active = true";
    const countParams = [];

    if (clinic_id) {
      countQuery += " AND clinic_id = $1";
      countParams.push(clinic_id);
    }

    const countResult = await db.query(countQuery, countParams);

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
    console.error("Get clinic admins error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Create clinic admin
exports.createClinicAdmin = async (req, res) => {
  try {
    const { email, password, full_name, phone, clinic_id, address } = req.body;

    // Check if clinic exists
    const clinicCheck = await db.query(
      "SELECT id FROM clinics WHERE id = $1 AND is_active = true",
      [clinic_id],
    );

    if (clinicCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    // Check if email already exists
    const emailCheck = await db.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.query(
      `INSERT INTO users (email, password, role, full_name, phone, clinic_id, address, created_by)
       VALUES ($1, $2, 'clinic_admin', $3, $4, $5, $6, $7)
       RETURNING id, email, role, full_name, phone, clinic_id, address, created_at`,
      [
        email,
        hashedPassword,
        full_name,
        phone,
        clinic_id,
        address,
        req.user.id,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Clinic admin created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create clinic admin error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update clinic admin
exports.updateClinicAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, address, is_active } = req.body;

    const result = await db.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           address = COALESCE($3, address),
           is_active = COALESCE($4, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND role = 'clinic_admin'
       RETURNING id, email, role, full_name, phone, clinic_id, address, is_active`,
      [full_name, phone, address, is_active, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Clinic admin not found",
      });
    }

    res.json({
      success: true,
      message: "Clinic admin updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update clinic admin error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Delete clinic admin (soft delete)
exports.deleteClinicAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `UPDATE users 
       SET is_active = false, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND role = 'clinic_admin'
       RETURNING id`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Clinic admin not found",
      });
    }

    res.json({
      success: true,
      message: "Clinic admin deleted successfully",
    });
  } catch (error) {
    console.error("Delete clinic admin error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
