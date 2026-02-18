cat > /mnt/user-data/outputs/hospital-api/API_ENDPOINTS_LIST.md << 'EOF'

# Complete API Endpoints List

## Base URL: `http://localhost:5000/api`

## 🔓 Authentication APIs (Public)

| Method | Endpoint                | Description      | Auth Required |
| ------ | ----------------------- | ---------------- | ------------- |
| POST   | `/auth/login`           | Login user       | No            |
| GET    | `/auth/profile`         | Get user profile | Yes           |
| PUT    | `/auth/profile`         | Update profile   | Yes           |
| POST   | `/auth/change-password` | Change password  | Yes           |
| POST   | `/auth/logout`          | Logout user      | Yes           |

---

## 👑 Super Admin APIs

| Method | Endpoint                         | Description          | Role Required |
| ------ | -------------------------------- | -------------------- | ------------- |
| GET    | `/super-admin/dashboard`         | Dashboard statistics | super_admin   |
| GET    | `/super-admin/clinics`           | Get all clinics      | super_admin   |
| POST   | `/super-admin/clinics`           | Create clinic        | super_admin   |
| PUT    | `/super-admin/clinics/:id`       | Update clinic        | super_admin   |
| DELETE | `/super-admin/clinics/:id`       | Delete clinic        | super_admin   |
| GET    | `/super-admin/clinic-admins`     | Get clinic admins    | super_admin   |
| POST   | `/super-admin/clinic-admins`     | Create clinic admin  | super_admin   |
| PUT    | `/super-admin/clinic-admins/:id` | Update clinic admin  | super_admin   |
| DELETE | `/super-admin/clinic-admins/:id` | Delete clinic admin  | super_admin   |

---

## 🏥 Clinic Admin APIs

| Method | Endpoint                    | Description            | Role Required |
| ------ | --------------------------- | ---------------------- | ------------- |
| GET    | `/clinic-admin/dashboard`   | Dashboard statistics   | clinic_admin  |
| POST   | `/clinic-admin/users`       | Create user (any role) | clinic_admin  |
| GET    | `/clinic-admin/users/:role` | Get users by role      | clinic_admin  |
| GET    | `/clinic-admin/user/:id`    | Get user details       | clinic_admin  |
| PUT    | `/clinic-admin/user/:id`    | Update user            | clinic_admin  |
| DELETE | `/clinic-admin/user/:id`    | Delete user            | clinic_admin  |

**Supported roles for user creation:**

- doctor
- receptionist
- pharmacist
- accountant
- lab_technician
- patient

---

## 📋 Receptionist APIs

| Method | Endpoint                     | Description          | Role Required |
| ------ | ---------------------------- | -------------------- | ------------- |
| GET    | `/receptionist/dashboard`    | Dashboard statistics | receptionist  |
| POST   | `/receptionist/appointments` | Create appointment   | receptionist  |
| GET    | `/receptionist/appointments` | Get appointments     | receptionist  |
| GET    | `/receptionist/daily-report` | Get daily report     | receptionist  |

**Query Parameters for appointments:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status (pending, approved, rejected, completed, cancelled)
- `date` - Filter by date (YYYY-MM-DD)

---

## 👨‍⚕️ Doctor APIs

| Method | Endpoint                                 | Description                | Role Required |
| ------ | ---------------------------------------- | -------------------------- | ------------- |
| GET    | `/doctor/dashboard`                      | Dashboard statistics       | doctor        |
| GET    | `/doctor/appointments`                   | Get appointments           | doctor        |
| PUT    | `/doctor/appointments/:id/status`        | Approve/reject appointment | doctor        |
| GET    | `/doctor/patient/:patientId`             | Get patient details        | doctor        |
| GET    | `/doctor/patient/:patientId/lab-reports` | Get patient lab reports    | doctor        |

**Appointment status values:**

- `approved`
- `rejected`

---

## 👤 Patient APIs

| Method | Endpoint                                | Description                          | Role Required |
| ------ | --------------------------------------- | ------------------------------------ | ------------- |
| GET    | `/patient/dashboard`                    | Dashboard with upcoming appointments | patient       |
| GET    | `/patient/appointments`                 | Get all appointments                 | patient       |
| GET    | `/patient/lab-reports`                  | Get lab reports                      | patient       |
| GET    | `/patient/treatment-bills`              | Get treatment bills                  | patient       |
| GET    | `/patient/medicine-bills`               | Get medicine bills                   | patient       |
| GET    | `/patient/medicine-bills/:billId/items` | Get medicine bill items              | patient       |
| GET    | `/patient/medical-history`              | Get complete medical history         | patient       |

---

## 💊 Pharmacist APIs

| Method | Endpoint                     | Description                         | Role Required |
| ------ | ---------------------------- | ----------------------------------- | ------------- |
| GET    | `/pharmacist/dashboard`      | Dashboard with revenue & stock info | pharmacist    |
| GET    | `/pharmacist/medicines`      | Get all medicines                   | pharmacist    |
| POST   | `/pharmacist/medicines`      | Add new medicine                    | pharmacist    |
| PUT    | `/pharmacist/medicines/:id`  | Update medicine                     | pharmacist    |
| POST   | `/pharmacist/medicine-bills` | Create medicine bill                | pharmacist    |
| GET    | `/pharmacist/medicine-bills` | Get medicine bills                  | pharmacist    |

**Query Parameters for medicines:**

- `page` - Page number
- `limit` - Items per page
- `search` - Search by name
- `low_stock` - Filter low stock (true/false)

---

## 💰 Accountant APIs

| Method | Endpoint                                  | Description                  | Role Required |
| ------ | ----------------------------------------- | ---------------------------- | ------------- |
| GET    | `/accountant/dashboard`                   | Dashboard with revenue stats | accountant    |
| POST   | `/accountant/treatment-bills`             | Create treatment bill        | accountant    |
| GET    | `/accountant/treatment-bills`             | Get treatment bills          | accountant    |
| PUT    | `/accountant/treatment-bills/:id/payment` | Update bill payment          | accountant    |
| GET    | `/accountant/revenue-report`              | Get revenue report           | accountant    |

**Bill status values:**

- `pending`
- `paid`
- `partially_paid`
- `cancelled`

**Revenue report query parameters:**

- `start_date` - Start date (YYYY-MM-DD)
- `end_date` - End date (YYYY-MM-DD)

---

## 🔬 Lab Technician APIs

| Method | Endpoint                      | Description          | Role Required  |
| ------ | ----------------------------- | -------------------- | -------------- |
| GET    | `/lab-technician/dashboard`   | Dashboard statistics | lab_technician |
| GET    | `/lab-technician/lab-tests`   | Get lab tests        | lab_technician |
| POST   | `/lab-technician/lab-reports` | Upload lab report    | lab_technician |
| GET    | `/lab-technician/lab-reports` | Get lab reports      | lab_technician |

**Lab test status values:**

- `pending`
- `completed`

---

## 🔔 Notification APIs (All Authenticated Users)

| Method | Endpoint                       | Description               | Role Required     |
| ------ | ------------------------------ | ------------------------- | ----------------- |
| GET    | `/notifications`               | Get all notifications     | Any authenticated |
| PUT    | `/notifications/:id/read`      | Mark notification as read | Any authenticated |
| PUT    | `/notifications/mark-all-read` | Mark all as read          | Any authenticated |
| DELETE | `/notifications/:id`           | Delete notification       | Any authenticated |

**Query Parameters:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `is_read` - Filter by read status (true/false)

---

## 📊 Common Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": [...]
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

---

## 🔑 Authentication Header

All protected endpoints require:

```
Authorization: Bearer <jwt_token>
```

Get the token from login response:

```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response includes token:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

---

## 📝 HTTP Status Codes

| Code | Meaning                                |
| ---- | -------------------------------------- |
| 200  | OK - Request successful                |
| 201  | Created - Resource created             |
| 400  | Bad Request - Invalid input            |
| 401  | Unauthorized - Authentication required |
| 403  | Forbidden - Insufficient permissions   |
| 404  | Not Found - Resource not found         |
| 500  | Internal Server Error                  |

---

## 🎯 Quick Test Examples

### 1. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@hospital.com","password":"SuperAdmin@123"}'
```

### 2. Get Dashboard (with token)

```bash
curl http://localhost:5000/api/super-admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Create Clinic

```bash
curl -X POST http://localhost:5000/api/super-admin/clinics \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "City Hospital",
    "address": "123 Main St",
    "phone": "1234567890",
    "email": "info@cityhospital.com"
  }'
```

---

## Total Endpoints: 50+

- Authentication: 5
- Super Admin: 9
- Clinic Admin: 6
- Receptionist: 4
- Doctor: 5
- Patient: 7
- Pharmacist: 6
- Accountant: 5
- Lab Technician: 4
- Notifications: 4

**All endpoints support proper error handling, validation, and audit logging.**
EOF
echo "API endpoints list created"
