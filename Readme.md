cat > /home/claude/hospital-api/README.md << 'EOF'

# Hospital Management System API

A comprehensive role-based Hospital & Clinic Management System API built with Express.js and PostgreSQL.

## Features

- **Role-Based Access Control**: Super Admin, Clinic Admin, Doctor, Receptionist, Pharmacist, Accountant, Lab Technician, Patient
- **Authentication**: Email and password-based login with JWT tokens
- **Multi-Clinic Support**: Manage multiple clinics/hospitals
- **Appointment Management**: Create, approve, and track appointments
- **Billing System**: Treatment and medicine billing
- **Pharmacy Inventory**: Medicine stock management with low-stock alerts
- **Lab Reports**: Upload and manage lab test results
- **Audit Logging**: Track all system activities
- **Notifications**: In-app and email notifications

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd hospital-api
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=hospital_management

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
```

4. **Create PostgreSQL database**

```bash
createdb hospital_management
```

5. **Initialize database**

```bash
node database/init.js
```

6. **Start the server**

```bash
# Development
npm run dev

# Production
npm start
```

## Default Credentials

**Super Admin:**

- Email: `superadmin@hospital.com`
- Password: `SuperAdmin@123`

⚠️ **IMPORTANT**: Change the super admin password immediately after first login!

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

### Super Admin

- `GET /api/super-admin/dashboard` - Dashboard stats
- `GET /api/super-admin/clinics` - Get all clinics
- `POST /api/super-admin/clinics` - Create clinic
- `PUT /api/super-admin/clinics/:id` - Update clinic
- `DELETE /api/super-admin/clinics/:id` - Delete clinic
- `GET /api/super-admin/clinic-admins` - Get clinic admins
- `POST /api/super-admin/clinic-admins` - Create clinic admin
- `PUT /api/super-admin/clinic-admins/:id` - Update clinic admin
- `DELETE /api/super-admin/clinic-admins/:id` - Delete clinic admin

### Clinic Admin

- `GET /api/clinic-admin/dashboard` - Dashboard stats
- `POST /api/clinic-admin/users` - Create user (doctor, receptionist, etc.)
- `GET /api/clinic-admin/users/:role` - Get users by role
- `GET /api/clinic-admin/user/:id` - Get user details
- `PUT /api/clinic-admin/user/:id` - Update user
- `DELETE /api/clinic-admin/user/:id` - Delete user

### Receptionist

- `GET /api/receptionist/dashboard` - Dashboard stats
- `POST /api/receptionist/appointments` - Create appointment
- `GET /api/receptionist/appointments` - Get appointments
- `GET /api/receptionist/daily-report` - Daily report

### Doctor

- `GET /api/doctor/dashboard` - Dashboard stats
- `GET /api/doctor/appointments` - Get appointments
- `PUT /api/doctor/appointments/:id/status` - Approve/reject appointment
- `GET /api/doctor/patient/:patientId` - Get patient details
- `GET /api/doctor/patient/:patientId/lab-reports` - Get patient lab reports

### Patient

- `GET /api/patient/dashboard` - Dashboard stats
- `GET /api/patient/appointments` - Get appointments
- `GET /api/patient/lab-reports` - Get lab reports
- `GET /api/patient/treatment-bills` - Get treatment bills
- `GET /api/patient/medicine-bills` - Get medicine bills
- `GET /api/patient/medicine-bills/:billId/items` - Get bill items
- `GET /api/patient/medical-history` - Get medical history

### Pharmacist

- `GET /api/pharmacist/dashboard` - Dashboard stats
- `GET /api/pharmacist/medicines` - Get medicines
- `POST /api/pharmacist/medicines` - Add medicine
- `PUT /api/pharmacist/medicines/:id` - Update medicine
- `POST /api/pharmacist/medicine-bills` - Create medicine bill
- `GET /api/pharmacist/medicine-bills` - Get medicine bills

### Accountant

- `GET /api/accountant/dashboard` - Dashboard stats
- `POST /api/accountant/treatment-bills` - Create treatment bill
- `GET /api/accountant/treatment-bills` - Get treatment bills
- `PUT /api/accountant/treatment-bills/:id/payment` - Update payment
- `GET /api/accountant/revenue-report` - Revenue report

### Lab Technician

- `GET /api/lab-technician/dashboard` - Dashboard stats
- `GET /api/lab-technician/lab-tests` - Get lab tests
- `POST /api/lab-technician/lab-reports` - Upload lab report
- `GET /api/lab-technician/lab-reports` - Get lab reports

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Database Schema

The database includes the following main tables:

- `clinics` - Hospital/clinic information
- `users` - All user accounts (all roles)
- `patient_details` - Extended patient information
- `appointments` - Appointment records
- `treatment_bills` - Treatment billing
- `medicines` - Medicine inventory
- `medicine_bills` - Medicine sales
- `medicine_bill_items` - Bill line items
- `lab_tests` - Lab test requests
- `lab_reports` - Lab test results
- `notifications` - User notifications
- `audit_logs` - System activity logs

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Audit logging
- Rate limiting
- Helmet.js security headers
- Input validation
- SQL injection prevention

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

Error responses format:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": []
}
```

## Development

Run in development mode with auto-reload:

```bash
npm run dev
```

## Testing

Test the API health:

```bash
curl http://localhost:5000/health
```

Test login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@hospital.com","password":"SuperAdmin@123"}'
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

## Support

For support, email support@hospital.com
EOF
echo "README created"
Output

README created
Done
Now let me create an API documentation file and a Postman collection template:

Creating comprehensive API documentation
Now let me create a .gitignore file and a setup guide:

Creating .gitignore file
Finally, let me create a quick start guide:

Creating quick start guide
Perfect! Now let me create one more file - a notification controller for managing notifications:

Creating notification controller
Now let me update the routes index to include notification routes:

Adding notification routes to the routes index
Perfect! Now let me move all files to the outputs directory and create a summary document:

Ran 2 commands

Copying the complete API to outputs directory
bash

cd /home/claude && cp -r hospital-api /mnt/user-data/outputs/ && echo "Files copied to outputs directory"
Output

Files copied to outputs directory

Creating comprehensive project summary
bash

cat > /mnt/user-data/outputs/hospital-api/PROJECT_SUMMARY.md << 'EOF'

# Hospital Management System API - Project Summary

## 📋 Project Overview

A complete, production-ready Hospital Management System API built with Express.js and PostgreSQL. This system implements role-based access control for managing multiple clinics/hospitals with comprehensive features for appointments, billing, pharmacy, and lab management.

## 🏗️ Project Structure

```
hospital-api/
├── config/
│   └── database.js                 # PostgreSQL connection configuration
├── controllers/
│   ├── authController.js           # Authentication & profile management
│   ├── superAdminController.js     # Super Admin operations
│   ├── clinicAdminController.js    # Clinic Admin operations
│   ├── receptionistController.js   # Receptionist operations
│   ├── doctorController.js         # Doctor operations
│   ├── patientController.js        # Patient operations
│   ├── pharmacistController.js     # Pharmacist operations
│   ├── accountantController.js     # Accountant operations
│   ├── labTechnicianController.js  # Lab Technician operations
│   └── notificationController.js   # Notification management
├── middleware/
│   ├── auth.js                     # JWT authentication & authorization
│   ├── auditLog.js                 # Audit logging middleware
│   └── validate.js                 # Request validation
├── routes/
│   ├── authRoutes.js               # Authentication routes
│   └── index.js                    # All API routes
├── database/
│   ├── schema.sql                  # Complete database schema
│   └── init.js                     # Database initialization script
├── server.js                        # Main application entry point
├── package.json                     # Dependencies and scripts
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore file
├── README.md                        # Main documentation
├── QUICK_START.md                   # Quick setup guide
├── API_DOCUMENTATION.md             # Complete API reference
└── PROJECT_SUMMARY.md               # This file
```

## 👥 User Roles & Capabilities

### 1. Super Admin

- Manages multiple clinics/hospitals
- Creates and manages clinic administrators
- System-wide oversight
- **Hardcoded Login:**
  - Email: `superadmin@hospital.com`
  - Password: `SuperAdmin@123`

### 2. Clinic Admin

- Manages single clinic
- Creates all staff roles (doctors, receptionists, etc.)
- Manages patients
- Monitors clinic performance

### 3. Doctor

- Approves/rejects appointments
- Views patient details and medical history
- Reviews lab reports
- Manages appointment schedule

### 4. Receptionist

- Creates and manages appointments
- Searches patients and doctors
- Generates daily reports
- Coordinates scheduling

### 5. Patient

- Views appointments
- Accesses lab reports
- Views billing history
- Tracks medical history

### 6. Pharmacist

- Manages medicine inventory
- Creates medicine bills
- Tracks stock levels
- Monitors expiry dates

### 7. Accountant

- Generates treatment bills
- Tracks revenue
- Manages payments
- Generates financial reports

### 8. Lab Technician

- Uploads lab reports
- Manages test completion
- Tracks pending tests

## 🔑 Key Features

### Authentication & Security

- ✅ Email and password-based login
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Password hashing with bcrypt
- ✅ Rate limiting
- ✅ Audit logging
- ✅ Input validation

### Appointment Management

- ✅ Create appointment requests
- ✅ Doctor approval workflow
- ✅ Time slot conflict prevention
- ✅ Status tracking
- ✅ Automated notifications

### Billing System

- ✅ Treatment bills
- ✅ Medicine bills with line items
- ✅ Payment tracking
- ✅ Bill status management
- ✅ Revenue analytics

### Pharmacy Management

- ✅ Medicine inventory
- ✅ Stock level monitoring
- ✅ Low stock alerts
- ✅ Expiry tracking
- ✅ Automatic bill generation

### Lab Management

- ✅ Lab test tracking
- ✅ Report uploads
- ✅ Patient and doctor notifications
- ✅ Report history

### Notifications

- ✅ In-app notifications
- ✅ Role-specific alerts
- ✅ Read/unread tracking
- ✅ Notification management

## 📊 Database Schema

### Core Tables

- `clinics` - Hospital/clinic information
- `users` - All user accounts (8 roles)
- `patient_details` - Extended patient info
- `appointments` - Appointment records
- `treatment_bills` - Treatment billing
- `medicines` - Pharmacy inventory
- `medicine_bills` - Medicine sales
- `medicine_bill_items` - Bill line items
- `lab_tests` - Lab test requests
- `lab_reports` - Test results
- `notifications` - User notifications
- `audit_logs` - System activity tracking

### Key Features

- UUID primary keys
- Foreign key constraints
- Automatic timestamp updates
- Enum types for status fields
- Indexes for performance
- Soft delete support

## 🚀 Quick Setup

1. **Install Dependencies**

```bash
npm install
```

2. **Configure Environment**

```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Create Database**

```bash
createdb hospital_management
```

4. **Initialize Database**

```bash
node database/init.js
```

5. **Start Server**

```bash
npm run dev
```

6. **Test Login**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@hospital.com","password":"SuperAdmin@123"}'
```

## 📚 API Endpoints Summary

### Authentication (Public)

- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile (Protected)
- `PUT /api/auth/profile` - Update profile (Protected)
- `POST /api/auth/change-password` - Change password (Protected)

### Super Admin (Protected)

- Dashboard, Clinics, Clinic Admins CRUD

### Clinic Admin (Protected)

- Dashboard, User management (all roles)

### Receptionist (Protected)

- Dashboard, Appointments, Daily reports

### Doctor (Protected)

- Dashboard, Appointments, Patient details, Lab reports

### Patient (Protected)

- Dashboard, Appointments, Bills, Medical history

### Pharmacist (Protected)

- Dashboard, Medicines, Inventory, Bills

### Accountant (Protected)

- Dashboard, Treatment bills, Revenue reports

### Lab Technician (Protected)

- Dashboard, Lab tests, Report uploads

### Notifications (All authenticated users)

- Get, Mark as read, Delete

## 🔐 Security Features

1. **Authentication**: JWT-based with configurable expiry
2. **Authorization**: Role-based access control
3. **Password Security**: Bcrypt hashing (10 rounds)
4. **Rate Limiting**: 100 requests per 15 minutes
5. **Helmet.js**: Security headers
6. **Input Validation**: Express-validator
7. **SQL Injection Prevention**: Parameterized queries
8. **Audit Logging**: All CRUD operations tracked
9. **CORS**: Configurable origins
10. **Error Handling**: Centralized error management

## 📈 Scalability Features

- Connection pooling (max 20 connections)
- Pagination on all list endpoints
- Indexed database queries
- Efficient JOIN operations
- Soft delete support
- Audit trail for compliance

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL 12+
- **Authentication**: JWT
- **Security**: Helmet, bcrypt, express-rate-limit
- **Validation**: express-validator
- **Logging**: Morgan
- **Environment**: dotenv

## 📝 Environment Variables

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=hospital_management

JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_password
```

## 🧪 Testing

### Manual Testing

- Use Postman or curl
- Import API endpoints
- Test all role workflows

### Database Testing

```bash
psql -U postgres -d hospital_management
SELECT * FROM users;
SELECT * FROM appointments;
```

## 📦 Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Change default passwords
- [ ] Configure CORS properly
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure email service
- [ ] Set up monitoring
- [ ] Use environment variables
- [ ] Enable logging

## 🐛 Common Issues

### Database Connection Failed

- Check PostgreSQL is running
- Verify credentials in `.env`
- Ensure database exists

### Port Already in Use

- Change PORT in `.env`
- Or stop process using the port

### Module Not Found

```bash
rm -rf node_modules
npm install
```

## 📖 Documentation Files

1. **README.md** - Main project documentation
2. **QUICK_START.md** - Step-by-step setup guide
3. **API_DOCUMENTATION.md** - Complete API reference
4. **PROJECT_SUMMARY.md** - This file

## 🎯 Next Steps

1. **For Super Admin**: Create clinics and clinic admins
2. **For Clinic Admin**: Create staff and patients
3. **For Receptionist**: Start creating appointments
4. **For Doctor**: Approve appointments, view patients
5. **For Pharmacist**: Add medicines to inventory
6. **For Accountant**: Generate bills
7. **For Lab Technician**: Upload reports
8. **For Patient**: View appointments and history

## 🤝 Support

For issues or questions:

- Check API documentation
- Review quick start guide
- Check console logs
- Verify database schema

## 📜 License

ISC

---

**Built with ❤️ for efficient hospital management**
EOF
echo "Project summary created"
Output

Project summary created
Done
Perfect! Let me create one final file listing all the API endpoints in a simple table format:

Creating complete API endpoints list

Perfect! Now let me present the complete API to the user:

Presented file
Complete Hospital Management System API Created! 🏥
I've built a comprehensive, production-ready Hospital Management System API with Express.js and PostgreSQL. Here's what you get:

🎯 Key Features:
8 User Roles with Complete Workflows:

Super Admin (hardcoded login ready)
Clinic Admin
Doctor
Receptionist
Patient
Pharmacist
Accountant
Lab Technician
50+ API Endpoints covering:

Authentication & Authorization
Multi-clinic management
Appointment scheduling
Treatment & medicine billing
Pharmacy inventory
Lab reports management
Notifications
Revenue tracking
📂 What's Included:
Complete Backend Structure
All controllers for 8 roles
JWT authentication with role-based access
PostgreSQL schema with all tables
Audit logging & security middleware
Database Setup
Complete SQL schema
Initialization script
Hardcoded Super Admin (email: superadmin@hospital.com, password: SuperAdmin@123)
Documentation
README.md - Main documentation
QUICK_START.md - Step-by-step setup
API_DOCUMENTATION.md - Complete API reference
API_ENDPOINTS_LIST.md - All endpoints table
PROJECT_SUMMARY.md - Project overview
🚀 Quick Start:
bash

# 1. Install dependencies

npm install

# 2. Configure .env file

cp .env.example .env

# Edit with your database credentials

# 3. Create database

createdb hospital_management

# 4. Initialize database

node database/init.js

# 5. Start server

npm run dev
The API returns the user's role in every login response, so your frontend can route users appropriately without role selection!

hospital-api
