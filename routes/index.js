const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middleware/auth");
const auditLog = require("../middleware/auditLog");

// Controllers
const superAdminController = require("../controllers/superAdminController");
const clinicAdminController = require("../controllers/clinicAdminController");
const receptionistController = require("../controllers/receptionistController");
const doctorController = require("../controllers/doctorController");
const patientController = require("../controllers/patientController");
const pharmacistController = require("../controllers/pharmacistController");
const accountantController = require("../controllers/accountantController");
const labTechnicianController = require("../controllers/labTechnicianController");
const notificationController = require("../controllers/notificationController");

// ========== NOTIFICATION ROUTES (All authenticated users) ==========
router.get("/notifications", auth, notificationController.getNotifications);
router.put("/notifications/:id/read", auth, notificationController.markAsRead);
router.put(
  "/notifications/mark-all-read",
  auth,
  notificationController.markAllAsRead,
);
router.delete(
  "/notifications/:id",
  auth,
  notificationController.deleteNotification,
);

// ========== SUPER ADMIN ROUTES ==========
router.get(
  "/super-admin/dashboard",
  auth,
  authorize("super_admin"),
  superAdminController.getDashboard,
);
router.get(
  "/super-admin/clinics",
  auth,
  authorize("super_admin"),
  superAdminController.getAllClinics,
);
router.post(
  "/super-admin/clinics",
  auth,
  authorize("super_admin"),
  auditLog("CREATE", "clinics"),
  superAdminController.createClinic,
);
router.put(
  "/super-admin/clinics/:id",
  auth,
  authorize("super_admin"),
  auditLog("UPDATE", "clinics"),
  superAdminController.updateClinic,
);
router.delete(
  "/super-admin/clinics/:id",
  auth,
  authorize("super_admin"),
  auditLog("DELETE", "clinics"),
  superAdminController.deleteClinic,
);

router.get(
  "/super-admin/clinic-admins",
  auth,
  authorize("super_admin"),
  superAdminController.getAllClinicAdmins,
);
router.post(
  "/super-admin/clinic-admins",
  auth,
  authorize("super_admin"),
  auditLog("CREATE", "users"),
  superAdminController.createClinicAdmin,
);
router.put(
  "/super-admin/clinic-admins/:id",
  auth,
  authorize("super_admin"),
  auditLog("UPDATE", "users"),
  superAdminController.updateClinicAdmin,
);
router.delete(
  "/super-admin/clinic-admins/:id",
  auth,
  authorize("super_admin"),
  auditLog("DELETE", "users"),
  superAdminController.deleteClinicAdmin,
);

// ========== CLINIC ADMIN ROUTES ==========
router.get(
  "/clinic-admin/dashboard",
  auth,
  authorize("clinic_admin"),
  clinicAdminController.getDashboard,
);
router.get(
  "/clinic-admin/clinic/profile/:clinicId",
  auth,
  authorize("clinic_admin"),
  clinicAdminController.getClinicById,
);
router.post(
  "/clinic-admin/users",
  auth,
  authorize("clinic_admin"),
  auditLog("CREATE", "users"),
  clinicAdminController.createUser,
);
router.get(
  "/clinic-admin/users/:role",
  auth,
  authorize("clinic_admin"),
  clinicAdminController.getUsersByRole,
);
router.get(
  "/clinic-admin/user/:id",
  auth,
  authorize("clinic_admin"),
  clinicAdminController.getUserById,
);
router.put(
  "/clinic-admin/user/:id",
  auth,
  authorize("clinic_admin"),
  auditLog("UPDATE", "users"),
  clinicAdminController.updateUser,
);
router.delete(
  "/clinic-admin/user/:id",
  auth,
  authorize("clinic_admin"),
  auditLog("DELETE", "users"),
  clinicAdminController.deleteUser,
);

// ========== RECEPTIONIST ROUTES ==========
// router.get(
//   "/receptionist/dashboard",
//   auth,
//   authorize("receptionist"),
//   receptionistController.getDashboard,
// );
router.post(
  "/receptionist/appointments",
  auth,
  authorize("receptionist"),
  auditLog("CREATE", "appointments"),
  receptionistController.createAppointment,
);
router.get(
  "/receptionist/appointments",
  auth,
  authorize("receptionist"),
  receptionistController.getAppointments,
);
router.get(
  "/receptionist/daily-report",
  auth,
  authorize("receptionist"),
  receptionistController.getDailyReport,
);

// ========== DOCTOR ROUTES ==========
router.get(
  "/doctor/dashboard",
  auth,
  authorize("doctor"),
  doctorController.getDashboard,
);
router.get(
  "/doctor/appointments",
  auth,
  authorize("doctor"),
  doctorController.getAppointments,
);
router.put(
  "/doctor/appointments/:id/status",
  auth,
  authorize("doctor"),
  auditLog("UPDATE", "appointments"),
  doctorController.updateAppointmentStatus,
);
router.get(
  "/doctor/patient/:patientId",
  auth,
  authorize("doctor"),
  doctorController.getPatientDetails,
);
router.get(
  "/doctor/patient/:patientId/lab-reports",
  auth,
  authorize("doctor"),
  doctorController.getPatientLabReports,
);

// ========== PATIENT ROUTES ==========
router.get(
  "/patient/dashboard",
  auth,
  authorize("patient"),
  patientController.getDashboard,
);
router.get(
  "/patient/appointments",
  auth,
  authorize("patient"),
  patientController.getAppointments,
);
router.get(
  "/patient/lab-reports",
  auth,
  authorize("patient"),
  patientController.getLabReports,
);
router.get(
  "/patient/treatment-bills",
  auth,
  authorize("patient"),
  patientController.getTreatmentBills,
);
router.get(
  "/patient/medicine-bills",
  auth,
  authorize("patient"),
  patientController.getMedicineBills,
);
router.get(
  "/patient/medicine-bills/:billId/items",
  auth,
  authorize("patient"),
  patientController.getMedicineBillItems,
);
router.get(
  "/patient/medical-history",
  auth,
  authorize("patient"),
  patientController.getMedicalHistory,
);

// ========== PHARMACIST ROUTES ==========
router.get(
  "/pharmacist/dashboard",
  auth,
  authorize("pharmacist"),
  pharmacistController.getDashboard,
);
router.get(
  "/pharmacist/medicines",
  auth,
  authorize("pharmacist"),
  pharmacistController.getMedicines,
);
router.post(
  "/pharmacist/medicines",
  auth,
  authorize("pharmacist"),
  auditLog("CREATE", "medicines"),
  pharmacistController.addMedicine,
);
router.put(
  "/pharmacist/medicines/:id",
  auth,
  authorize("pharmacist"),
  auditLog("UPDATE", "medicines"),
  pharmacistController.updateMedicine,
);
router.post(
  "/pharmacist/medicine-bills",
  auth,
  authorize("pharmacist"),
  auditLog("CREATE", "medicine_bills"),
  pharmacistController.createMedicineBill,
);
router.get(
  "/pharmacist/medicine-bills",
  auth,
  authorize("pharmacist"),
  pharmacistController.getMedicineBills,
);

// ========== ACCOUNTANT ROUTES ==========
router.get(
  "/accountant/dashboard",
  auth,
  authorize("accountant"),
  accountantController.getDashboard,
);
router.post(
  "/accountant/treatment-bills",
  auth,
  authorize("accountant"),
  auditLog("CREATE", "treatment_bills"),
  accountantController.createTreatmentBill,
);
router.get(
  "/accountant/treatment-bills",
  auth,
  authorize("accountant"),
  accountantController.getTreatmentBills,
);
router.put(
  "/accountant/treatment-bills/:id/payment",
  auth,
  authorize("accountant"),
  auditLog("UPDATE", "treatment_bills"),
  accountantController.updateBillPayment,
);
router.get(
  "/accountant/revenue-report",
  auth,
  authorize("accountant"),
  accountantController.getRevenueReport,
);

// ========== LAB TECHNICIAN ROUTES ==========
router.get(
  "/lab-technician/dashboard",
  auth,
  authorize("lab_technician"),
  labTechnicianController.getDashboard,
);
router.get(
  "/lab-technician/lab-tests",
  auth,
  authorize("lab_technician"),
  labTechnicianController.getLabTests,
);
router.post(
  "/lab-technician/lab-reports",
  auth,
  authorize("lab_technician"),
  auditLog("CREATE", "lab_reports"),
  labTechnicianController.uploadLabReport,
);
router.get(
  "/lab-technician/lab-reports",
  auth,
  authorize("lab_technician"),
  labTechnicianController.getLabReports,
);

// ========== RECEPTIONIST ROUTES ==========
router.get(
  "/receptionist/dashboard",
  auth,
  authorize("receptionist"),
  receptionistController.getDashboard,
);

// Patient management
router.get(
  "/receptionist/patients",
  auth,
  authorize("receptionist"),
  receptionistController.getPatients,
);
router.get(
  "/receptionist/patients/:id",
  auth,
  authorize("receptionist"),
  receptionistController.getPatientById,
);
router.put(
  "/receptionist/patients/:id",
  auth,
  authorize("receptionist"),
  auditLog("UPDATE", "users"),
  receptionistController.updatePatient,
);

// Appointments
router.post(
  "/receptionist/appointments",
  auth,
  authorize("receptionist"),
  auditLog("CREATE", "appointments"),
  receptionistController.createAppointment,
);
router.get(
  "/receptionist/appointments",
  auth,
  authorize("receptionist"),
  receptionistController.getAppointments,
);
router.get(
  "/receptionist/daily-report",
  auth,
  authorize("receptionist"),
  receptionistController.getDailyReport,
);

module.exports = router;
