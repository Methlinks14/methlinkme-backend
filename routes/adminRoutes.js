const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getPendingPayments,
  confirmPayment,
  rejectPayment,
  getAllUsers,
  getAllProviders,
  toggleUserStatus,
  deleteProvider,
  featureProvider,
  deleteRating
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes are protected
router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/payments', getPendingPayments);
router.put('/payments/:id/confirm', confirmPayment);
router.put('/payments/:id/reject', rejectPayment);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.get('/providers', getAllProviders);
router.put('/providers/:id/feature', featureProvider);
router.delete('/providers/:id', deleteProvider);
router.delete('/ratings/:id', deleteRating);

module.exports = router;