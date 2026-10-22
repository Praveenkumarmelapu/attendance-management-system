/**
 * middleware/roleMiddleware.js — Role-Based Authorization
 *
 * After authMiddleware verifies WHO the user is,
 * roleMiddleware checks WHAT they're allowed to do.
 *
 * Usage example:
 *   router.delete('/:id', protect, authorize('admin'), deleteStudent)
 *   → Only admins can delete students
 *
 * authorize() returns a middleware function that checks req.user.role
 */

const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user is set by authMiddleware
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { authorize };
