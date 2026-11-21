import jwt from "jsonwebtoken";
import prisma from "../../config/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "sms_odoo_jwt_secret_super_secure_key";

/**
 * Authentication Middleware:
 * Verifies JWT token from httpOnly cookie or Authorization header.
 * Attaches the authenticated user object with role and module to req.user.
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Authentication required. Please login." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        membership: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found or token invalid." });
    }

    // Check staff table for role and assigned module (stored in designation)
    const staff = await prisma.staff.findUnique({ where: { email: user.email } });

    req.user = {
      ...user,
      role: staff?.role || decoded.role || "MEMBER",
      module: staff?.designation || decoded.module || null,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please login again." });
    }
    return res.status(401).json({ message: "Invalid authentication token." });
  }
};

/**
 * Optional Authentication Middleware:
 * If a valid token is present, attaches user to req.user.
 * If no token is provided or invalid, proceeds without failing (req.user = null).
 */
export const optionalAuthenticate = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        membership: true,
      },
    });

    if (user) {
      const staff = await prisma.staff.findUnique({ where: { email: user.email } });
      req.user = {
        ...user,
        role: staff?.role || decoded.role || "MEMBER",
        module: staff?.designation || decoded.module || null,
      };
    } else {
      req.user = null;
    }

    next();
  } catch {
    req.user = null;
    next();
  }
};

/**
 * Role-Based Access Control Middleware:
 * Verifies that the authenticated user possesses one of the allowed roles.
 * Allowed roles: 'ADMIN', 'SUBADMIN', 'MEMBER'
 */
export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden. Requires one of the following roles: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};

/**
 * Module Access Control Middleware:
 * - Admin can see and manage all modules.
 * - Sub-admin can only access data belonging to their assigned module (e.g., 'staff', 'sports').
 * - Members have access if explicitly allowed or handled per module logic.
 */
export const authorizeModule = (requiredModule) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    // Admin has full access to all modules
    if (req.user.role === "ADMIN") {
      return next();
    }

    // Sub-admin has access only to their assigned module
    if (req.user.role === "SUBADMIN") {
      const userModule = (req.user.module || "").trim().toLowerCase();
      const targetModule = (requiredModule || "").trim().toLowerCase();

      if (userModule === targetModule) {
        return next();
      }

      return res.status(403).json({
        message: `Access denied. Sub-admin is assigned to '${req.user.module}' module, not '${requiredModule}'.`,
      });
    }

    // Members or other roles do not have subadmin module administrative privileges
    return res.status(403).json({
      message: `Access denied for role '${req.user.role}' on '${requiredModule}' module.`,
    });
  };
};
