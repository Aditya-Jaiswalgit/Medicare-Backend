const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { auth } = require("../middleware/auth");
const validate = require("../middleware/validate");

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
    validate,
  ],
  authController.login,
);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get("/profile", auth, authController.getProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", auth, authController.updateProfile);

// @route   POST /api/auth/change-password
// @desc    Change password
// @access  Private
router.post(
  "/change-password",
  auth,
  [
    body("current_password")
      .notEmpty()
      .withMessage("Current password is required"),
    body("new_password")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
    validate,
  ],
  authController.changePassword,
);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post("/logout", auth, authController.logout);

module.exports = router;

// Auth routes created

// Creating routes directory and auth routes file

// Script
// Done
// Due to length constraints, let me create a comprehensive routes index file that includes all routes:

// Creating main routes index file with all API endpoints
// Now let me create the main server.js file:

// Creating main server.js file
// Now let me create the database initialization script and README:

// Ran 2 commands
// Now let me create an API documentation file and a Postman collection template:

// Creating comprehensive API documentation
// Now let me create a .gitignore file and a setup guide:

// Creating .gitignore file
// Finally, let me create a quick start guide:

// Creating quick start guide
// Perfect! Now let me create one more file - a notification controller for managing notifications:

// Creating notification controller
// Now let me update the routes index to include notification routes:

// Adding notification routes to the routes index
// Perfect! Now let me move all files to the outputs directory and create a summary document:

// Ran 2 commands

// Copying the complete API to outputs directory
// bash

// cd /home/claude && cp -r hospital-api /mnt/user-data/outputs/ && echo "Files copied to outputs directory"
// Output

// Files copied to outputs directory

// Creating comprehensive project summary
// bash

// cat > /mnt/user-data/outputs/hospital-api/PROJECT_SUMMARY.md << 'EOF'
// # Hospital Management System API - Project Summary

// ## 📋 Project Overview

// A complete, production-ready Hospital Management System API built with Express.js and PostgreSQL. This system implements role-based access control for managing multiple clinics/hospitals with comprehensive features for appointments, billing, pharmacy, and lab management.

// ## 🏗️ Project Structure

// ```
// hospital-api/
// ├── config/
// │   └── database.js                 # PostgreSQL connection configuration
// ├── controllers/
// │   ├── authController.js           # Authentication & profile management
// │   ├── superAdminController.js     # Super Admin operations
// │   ├── clinicAdminController.js    # Clinic Admin operations
// │   ├── receptionistController.js   # Receptionist operations
// │   ├── doctorController.js         # Doctor operations
// │   ├── patientController.js        # Patient operations
// │   ├── pharmacistController.js     # Pharmacist operations
// │   ├── accountantController.js     # Accountant operations
// │   ├── labTechnicianController.js  # Lab Technician operations
// │   └── notificationController.js   # Notification management
// ├── middleware/
// │   ├── auth.js                     # JWT authentication & authorization
// │   ├── auditLog.js                 # Audit logging middleware
// │   └── validate.js                 # Request validation
// ├── routes/
// │   ├── authRoutes.js               # Authentication routes
// │   └── index.js                    # All API routes
// ├── database/
// │   ├── schema.sql                  # Complete database schema
// │   └── init.js                     # Database initialization script
// ├── server.js                        # Main application entry point
// ├── package.json                     # Dependencies and scripts
// ├── .env.example                     # Environment variables template
// ├── .gitignore                       # Git ignore file
// ├── README.md                        # Main documentation
// ├── QUICK_START.md                   # Quick setup guide
// ├── API_DOCUMENTATION.md             # Complete API reference
// └── PROJECT_SUMMARY.md               # This file
// ```

// ## 👥 User Roles & Capabilities

// ### 1. Super Admin
// - Manages multiple clinics/hospitals
// - Creates and manages clinic administrators
// - System-wide oversight
// - **Hardcoded Login:**
//   - Email: `superadmin@hospital.com`
//   - Password: `SuperAdmin@123`

// ### 2. Clinic Admin
// - Manages single clinic
// - Creates all staff roles (doctors, receptionists, etc.)
// - Manages patients
// - Monitors clinic performance

// ### 3. Doctor
// - Approves/rejects appointments
// - Views patient details and medical history
// - Reviews lab reports
// - Manages appointment schedule

// ### 4. Receptionist
// - Creates and manages appointments
// - Searches patients and doctors
// - Generates daily reports
// - Coordinates scheduling

// ### 5. Patient
// - Views appointments
// - Accesses lab reports
// - Views billing history
// - Tracks medical history

// ### 6. Pharmacist
// - Manages medicine inventory
// - Creates medicine bills
// - Tracks stock levels
// - Monitors expiry dates

// ### 7. Accountant
// - Generates treatment bills
// - Tracks revenue
// - Manages payments
// - Generates financial reports

// ### 8. Lab Technician
// - Uploads lab reports
// - Manages test completion
// - Tracks pending tests

// ## 🔑 Key Features

// ### Authentication & Security
// - ✅ Email and password-based login
// - ✅ JWT token authentication
// - ✅ Role-based access control
// - ✅ Password hashing with bcrypt
// - ✅ Rate limiting
// - ✅ Audit logging
// - ✅ Input validation

// ### Appointment Management
// - ✅ Create appointment requests
// - ✅ Doctor approval workflow
// - ✅ Time slot conflict prevention
// - ✅ Status tracking
// - ✅ Automated notifications

// ### Billing System
// - ✅ Treatment bills
// - ✅ Medicine bills with line items
// - ✅ Payment tracking
// - ✅ Bill status management
// - ✅ Revenue analytics

// ### Pharmacy Management
// - ✅ Medicine inventory
// - ✅ Stock level monitoring
// - ✅ Low stock alerts
// - ✅ Expiry tracking
// - ✅ Automatic bill generation

// ### Lab Management
// - ✅ Lab test tracking
// - ✅ Report uploads
// - ✅ Patient and doctor notifications
// - ✅ Report history

// ### Notifications
// - ✅ In-app notifications
// - ✅ Role-specific alerts
// - ✅ Read/unread tracking
// - ✅ Notification management

// ## 📊 Database Schema

// ### Core Tables
// - `clinics` - Hospital/clinic information
// - `users` - All user accounts (8 roles)
// - `patient_details` - Extended patient info
// - `appointments` - Appointment records
// - `treatment_bills` - Treatment billing
// - `medicines` - Pharmacy inventory
// - `medicine_bills` - Medicine sales
// - `medicine_bill_items` - Bill line items
// - `lab_tests` - Lab test requests
// - `lab_reports` - Test results
// - `notifications` - User notifications
// - `audit_logs` - System activity tracking

// ### Key Features
// - UUID primary keys
// - Foreign key constraints
// - Automatic timestamp updates
// - Enum types for status fields
// - Indexes for performance
// - Soft delete support

// ## 🚀 Quick Setup

// 1. **Install Dependencies**
// ```bash
// npm install
// ```

// 2. **Configure Environment**
// ```bash
// cp .env.example .env
// # Edit .env with your database credentials
// ```

// 3. **Create Database**
// ```bash
// createdb hospital_management
// ```

// 4. **Initialize Database**
// ```bash
// node database/init.js
// ```

// 5. **Start Server**
// ```bash
// npm run dev
// ```

// 6. **Test Login**
// ```bash
// curl -X POST http://localhost:5000/api/auth/login \
//   -H "Content-Type: application/json" \
//   -d '{"email":"superadmin@hospital.com","password":"SuperAdmin@123"}'
// ```

// ## 📚 API Endpoints Summary

// ### Authentication (Public)
// - `POST /api/auth/login` - Login
// - `GET /api/auth/profile` - Get profile (Protected)
// - `PUT /api/auth/profile` - Update profile (Protected)
// - `POST /api/auth/change-password` - Change password (Protected)

// ### Super Admin (Protected)
// - Dashboard, Clinics, Clinic Admins CRUD

// ### Clinic Admin (Protected)
// - Dashboard, User management (all roles)

// ### Receptionist (Protected)
// - Dashboard, Appointments, Daily reports

// ### Doctor (Protected)
// - Dashboard, Appointments, Patient details, Lab reports

// ### Patient (Protected)
// - Dashboard, Appointments, Bills, Medical history

// ### Pharmacist (Protected)
// - Dashboard, Medicines, Inventory, Bills

// ### Accountant (Protected)
// - Dashboard, Treatment bills, Revenue reports

// ### Lab Technician (Protected)
// - Dashboard, Lab tests, Report uploads

// ### Notifications (All authenticated users)
// - Get, Mark as read, Delete

// ## 🔐 Security Features

// 1. **Authentication**: JWT-based with configurable expiry
// 2. **Authorization**: Role-based access control
// 3. **Password Security**: Bcrypt hashing (10 rounds)
// 4. **Rate Limiting**: 100 requests per 15 minutes
// 5. **Helmet.js**: Security headers
// 6. **Input Validation**: Express-validator
// 7. **SQL Injection Prevention**: Parameterized queries
// 8. **Audit Logging**: All CRUD operations tracked
// 9. **CORS**: Configurable origins
// 10. **Error Handling**: Centralized error management

// ## 📈 Scalability Features

// - Connection pooling (max 20 connections)
// - Pagination on all list endpoints
// - Indexed database queries
// - Efficient JOIN operations
// - Soft delete support
// - Audit trail for compliance

// ## 🛠️ Technology Stack

// - **Backend**: Node.js, Express.js
// - **Database**: PostgreSQL 12+
// - **Authentication**: JWT
// - **Security**: Helmet, bcrypt, express-rate-limit
// - **Validation**: express-validator
// - **Logging**: Morgan
// - **Environment**: dotenv

// ## 📝 Environment Variables

// ```env
// PORT=5000
// NODE_ENV=development

// DB_HOST=localhost
// DB_PORT=5432
// DB_USER=postgres
// DB_PASSWORD=your_password
// DB_NAME=hospital_management

// JWT_SECRET=your_jwt_secret
// JWT_EXPIRE=7d

// EMAIL_HOST=smtp.gmail.com
// EMAIL_PORT=587
// EMAIL_USER=your_email@gmail.com
// EMAIL_PASSWORD=your_password
// ```

// ## 🧪 Testing

// ### Manual Testing
// - Use Postman or curl
// - Import API endpoints
// - Test all role workflows

// ### Database Testing
// ```bash
// psql -U postgres -d hospital_management
// SELECT * FROM users;
// SELECT * FROM appointments;
// ```

// ## 📦 Deployment Checklist

// - [ ] Set `NODE_ENV=production`
// - [ ] Use strong `JWT_SECRET`
// - [ ] Change default passwords
// - [ ] Configure CORS properly
// - [ ] Enable HTTPS
// - [ ] Set up database backups
// - [ ] Configure email service
// - [ ] Set up monitoring
// - [ ] Use environment variables
// - [ ] Enable logging

// ## 🐛 Common Issues

// ### Database Connection Failed
// - Check PostgreSQL is running
// - Verify credentials in `.env`
// - Ensure database exists

// ### Port Already in Use
// - Change PORT in `.env`
// - Or stop process using the port

// ### Module Not Found
// ```bash
// rm -rf node_modules
// npm install
// ```

// ## 📖 Documentation Files

// 1. **README.md** - Main project documentation
// 2. **QUICK_START.md** - Step-by-step setup guide
// 3. **API_DOCUMENTATION.md** - Complete API reference
// 4. **PROJECT_SUMMARY.md** - This file

// ## 🎯 Next Steps

// 1. **For Super Admin**: Create clinics and clinic admins
// 2. **For Clinic Admin**: Create staff and patients
// 3. **For Receptionist**: Start creating appointments
// 4. **For Doctor**: Approve appointments, view patients
// 5. **For Pharmacist**: Add medicines to inventory
// 6. **For Accountant**: Generate bills
// 7. **For Lab Technician**: Upload reports
// 8. **For Patient**: View appointments and history

// ## 🤝 Support

// For issues or questions:
// - Check API documentation
// - Review quick start guide
// - Check console logs
// - Verify database schema

// ## 📜 License

// ISC

// ---

// **Built with ❤️ for efficient hospital management**
// EOF
// echo "Project summary created"
// Output

// Project summary created
// Done
// Perfect! Let me create one final file listing all the API endpoints in a simple table format:

// Creating complete API endpoints list

// Perfect! Now let me present the complete API to the user:

// Presented file
// Complete Hospital Management System API Created! 🏥
// I've built a comprehensive, production-ready Hospital Management System API with Express.js and PostgreSQL. Here's what you get:

// 🎯 Key Features:
// 8 User Roles with Complete Workflows:

// Super Admin (hardcoded login ready)
// Clinic Admin
// Doctor
// Receptionist
// Patient
// Pharmacist
// Accountant
// Lab Technician
// 50+ API Endpoints covering:

// Authentication & Authorization
// Multi-clinic management
// Appointment scheduling
// Treatment & medicine billing
// Pharmacy inventory
// Lab reports management
// Notifications
// Revenue tracking
// 📂 What's Included:
// Complete Backend Structure
// All controllers for 8 roles
// JWT authentication with role-based access
// PostgreSQL schema with all tables
// Audit logging & security middleware
// Database Setup
// Complete SQL schema
// Initialization script
// Hardcoded Super Admin (email: superadmin@hospital.com, password: SuperAdmin@123)
// Documentation
// README.md - Main documentation
// QUICK_START.md - Step-by-step setup
// API_DOCUMENTATION.md - Complete API reference
// API_ENDPOINTS_LIST.md - All endpoints table
// PROJECT_SUMMARY.md - Project overview
// 🚀 Quick Start:
// bash
// # 1. Install dependencies
// npm install

// # 2. Configure .env file
// cp .env.example .env
// # Edit with your database credentials

// # 3. Create database
// createdb hospital_management

// # 4. Initialize database
// node database/init.js

// # 5. Start server
// npm run dev
// The API returns the user's role in every login response, so your frontend can route users appropriately without role selection!

// hospital-api
