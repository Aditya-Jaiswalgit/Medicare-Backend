const bcrypt = require("bcrypt");
const db = require("../config/database");

// Get dashboard stats
exports.getDashboard = async (req, res) => {
  try {
    const clinicId = req.user.clinic_id;

    // Total doctors
    const doctorsResult = await db.query(
      "SELECT COUNT(*) as total FROM users WHERE clinic_id = $1 AND role = 'doctor' AND is_active = true",
      [clinicId],
    );

    // Total receptionists
    const receptionistsResult = await db.query(
      "SELECT COUNT(*) as total FROM users WHERE clinic_id = $1 AND role = 'receptionist' AND is_active = true",
      [clinicId],
    );

    // Total pharmacists
    const pharmacistsResult = await db.query(
      "SELECT COUNT(*) as total FROM users WHERE clinic_id = $1 AND role = 'pharmacist' AND is_active = true",
      [clinicId],
    );

    // Total accountants
    const accountantsResult = await db.query(
      "SELECT COUNT(*) as total FROM users WHERE clinic_id = $1 AND role = 'accountant' AND is_active = true",
      [clinicId],
    );

    // Total lab technicians
    const labTechsResult = await db.query(
      "SELECT COUNT(*) as total FROM users WHERE clinic_id = $1 AND role = 'lab_technician' AND is_active = true",
      [clinicId],
    );

    // Total patients
    const patientsResult = await db.query(
      "SELECT COUNT(*) as total FROM users WHERE clinic_id = $1 AND role = 'patient' AND is_active = true",
      [clinicId],
    );

    // Today's appointments
    const todayAppointmentsResult = await db.query(
      `SELECT COUNT(*) as total 
       FROM appointments 
       WHERE clinic_id = $1 AND appointment_date = CURRENT_DATE`,
      [clinicId],
    );

    // This week's revenue
    const weekRevenueResult = await db.query(
      `SELECT 
        COALESCE(SUM(total_amount), 0) as treatment_revenue
       FROM treatment_bills 
       WHERE clinic_id = $1 
       AND created_at >= CURRENT_DATE - INTERVAL '7 days'
       AND status = 'paid'`,
      [clinicId],
    );

    const weekMedicineRevenueResult = await db.query(
      `SELECT 
        COALESCE(SUM(total_amount), 0) as medicine_revenue
       FROM medicine_bills 
       WHERE clinic_id = $1 
       AND created_at >= CURRENT_DATE - INTERVAL '7 days'
       AND status = 'paid'`,
      [clinicId],
    );

    const totalWeekRevenue =
      parseFloat(weekRevenueResult.rows[0].treatment_revenue) +
      parseFloat(weekMedicineRevenueResult.rows[0].medicine_revenue);

    res.json({
      success: true,
      data: {
        total_doctors: parseInt(doctorsResult.rows[0].total),
        total_receptionists: parseInt(receptionistsResult.rows[0].total),
        total_pharmacists: parseInt(pharmacistsResult.rows[0].total),
        total_accountants: parseInt(accountantsResult.rows[0].total),
        total_lab_technicians: parseInt(labTechsResult.rows[0].total),
        total_patients: parseInt(patientsResult.rows[0].total),
        today_appointments: parseInt(todayAppointmentsResult.rows[0].total),
        week_revenue: totalWeekRevenue,
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

// Create user (doctor, receptionist, pharmacist, accountant, lab_technician, patient)
exports.createUser = async (req, res) => {
  try {
    const {
      email,
      password,
      role,
      full_name,
      phone,
      address,
      department,
      specialization,
      date_of_birth,
      blood_group,
    } = req.body;
    const clinicId = req.user.clinic_id;

    // Validate role
    const allowedRoles = [
      "doctor",
      "receptionist",
      "pharmacist",
      "accountant",
      "lab_technician",
      "patient",
    ];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
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
      `INSERT INTO users (email, password, role, full_name, phone, clinic_id, address, department, specialization, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, email, role, full_name, phone, clinic_id, address, department, specialization, created_at`,
      [
        email,
        hashedPassword,
        role,
        full_name,
        phone,
        clinicId,
        address,
        department,
        specialization,
        req.user.id,
      ],
    );

    const userId = result.rows[0].id;

    // If patient, create patient details
    if (role === "patient") {
      await db.query(
        `INSERT INTO patient_details (user_id, date_of_birth, blood_group)
         VALUES ($1, $2, $3)`,
        [userId, date_of_birth || null, blood_group || null],
      );
    }

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get all users by role
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;
    const clinicId = req.user.clinic_id;

    // Validate role
    const allowedRoles = [
      "doctor",
      "receptionist",
      "pharmacist",
      "accountant",
      "lab_technician",
      "patient",
    ];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    let query = `
      SELECT u.id, u.email, u.role, u.full_name, u.phone, u.address, u.department, 
             u.specialization, u.is_active, u.created_at
      FROM users u
      WHERE u.clinic_id = $1 AND u.role = $2 AND u.is_active = true
    `;

    const params = [clinicId, role];

    if (search) {
      query += ` AND (u.full_name ILIKE $3 OR u.email ILIKE $3 OR u.phone ILIKE $3)`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery =
      "SELECT COUNT(*) FROM users WHERE clinic_id = $1 AND role = $2 AND is_active = true";
    const countParams = [clinicId, role];

    if (search) {
      countQuery +=
        " AND (full_name ILIKE $3 OR email ILIKE $3 OR phone ILIKE $3)";
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
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinic_id;

    const result = await db.query(
      `SELECT u.*, pd.date_of_birth, pd.blood_group, pd.emergency_contact, pd.medical_history, pd.allergies
       FROM users u
       LEFT JOIN patient_details pd ON u.id = pd.user_id
       WHERE u.id = $1 AND u.clinic_id = $2`,
      [id, clinicId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = result.rows[0];
    delete user.password;

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, address, department, specialization, is_active } =
      req.body;
    const clinicId = req.user.clinic_id;

    const result = await db.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           address = COALESCE($3, address),
           department = COALESCE($4, department),
           specialization = COALESCE($5, specialization),
           is_active = COALESCE($6, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND clinic_id = $8
       RETURNING id, email, role, full_name, phone, address, department, specialization, is_active`,
      [
        full_name,
        phone,
        address,
        department,
        specialization,
        is_active,
        id,
        clinicId,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Delete user (soft delete)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinic_id;

    const result = await db.query(
      "UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND clinic_id = $2 RETURNING id",
      [id, clinicId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get single clinic information by clinic ID
exports.getClinicById = async (req, res) => {
  try {
    const { clinicId } = req.params;

    const result = await db.query(
      `SELECT 
        c.id,
        c.name,
        c.address,
        c.phone,
        c.email,
        c.created_at,
        c.updated_at,
        c.is_active,
        (SELECT COUNT(*) FROM users WHERE clinic_id = c.id AND role = 'clinic_admin' AND is_active = true) as admin_count
      FROM clinics c
      WHERE c.id = $1 AND c.is_active = true`,
      [clinicId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Get clinic by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
