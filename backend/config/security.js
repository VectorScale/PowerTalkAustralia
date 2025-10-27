const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');



const limiter = rateLimit({
  windowMs: 5 * 1000, // 15 minutes
  max: 150, // Limit each IP to 100 requests per `window` (here, per 15 minutes
  message: "Too many requests from this IP, please try again after 15 minutes",
});

/**
 * Express middleware for JWT token authentication and authorization.
 * 
 * This function intercepts incoming HTTP requests to validate JWT bearer tokens
 * from the Authorization header. It provides:
 * - Token extraction from 'Bearer <token>' format
 * - JWT verification against the application's secret key
 * - Automatic user context attachment to the request object
 * - Proper HTTP status codes for authentication failures
 * 
 * 
 * Response Flow:
 * - 401 Unauthorized: When no token is provided
 * - 403 Forbidden: When token is invalid, expired, or malformed
 * - Continues to next middleware: When token is valid
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 * @param {Function} next - Express next middleware function
 * 
 * @example
 * app.get('/protected-route', authenticateToken, (req, res) => {
 *   // req.user contains decoded JWT payload
 *   res.json({ message: 'Access granted', user: req.user });
 * });
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  //console.log(jwt.verify(token, process.env.JWT_SECRET))
  try{
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      req.user = user; // Add user info to request object
      console.log("Verification of", token, "Successful")
      next();
  });
  }catch{
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  
}
/**
 * Higher-order middleware factory for role-based access control (RBAC).
 * 
 * Creates Express middleware that enforces hierarchical role permissions by
 * validating JWT tokens against required role levels. Implements a tiered
 * permission system where higher roles inherit access to lower role endpoints.
 * 
 * Role Hierarchy (highest to lowest):
 * - association → council → club
 * 
 * Permission Rules:
 * - 'association' role: Access only to association-specific endpoints
 * - 'council' role: Access to council + association endpoints  
 * - 'club' role: Access to club + council + association endpoints
 * 
 * Security Features:
 * - Extracts and verifies JWT token from Authorization header
 * - Validates user's 'access' claim against required role
 * - Returns 403 with clear error messaging for permission denials
 * - Maintains hierarchical access inheritance
 * 
 * @param {string} role - Required role level ('club', 'council', 'association')
 * @returns {Function}  -Express middleware function
 * 
 * @example
 * // Club members and higher can access
 * app.get('/club-data', requireRole('club'), handler);
 * 
 * // Only council members and higher can access  
 * app.get('/council-data', requireRole('council'), handler);
 * 
 * // Only association members can access
 * app.get('/association-data', requireRole('association'), handler);
 */
function requireRole(role) {
  return (req, res, next) => {
    //console.log(req)
    const authHeader = req.headers['authorization'];
    //console.log(req.headers['authorization'])
    const token = authHeader && authHeader.split(' ')[1]; 
    const { access } = jwt.verify(token, process.env.JWT_SECRET);
    //console.log(access);
    if(role == 'club'){
      if (!req.headers['authorization'] || (access != role && access != 'council' && access != 'association')) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: role
        });
      }
    }
    else if(role == 'council'){
      if (!req.headers['authorization'] || (access != role && access != 'association')) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: role
        });
      }
    }
    else if(role == 'association'){
      if (!req.headers['authorization'] || access != role) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: role
        });
      }
    }
    
    next();
  };
}

module.exports = { authenticateToken, requireRole, limiter};