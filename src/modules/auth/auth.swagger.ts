/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterUserRequest:
 *       type: object
 *       required:
 *         - fullName
 *         - email
 *         - password
 *         - confirmPassword
 *       properties:
 *         fullName:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         password:
 *           type: string
 *           minLength: 6
 *           example: password123
 *         confirmPassword:
 *           type: string
 *           minLength: 6
 *           example: password123
 * 
 *     RegisterAdminRequest:
 *       type: object
 *       required:
 *         - fullName
 *         - email
 *         - password
 *         - confirmPassword
 *         - adminCode
 *       properties:
 *         fullName:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: Admin User
 *         email:
 *           type: string
 *           format: email
 *           example: admin@example.com
 *         password:
 *           type: string
 *           minLength: 6
 *           example: admin123
 *         confirmPassword:
 *           type: string
 *           minLength: 6
 *           example: admin123
 *         adminCode:
 *           type: string
 *           description: Secret admin registration code
 *           example: your-super-secret-key-2025
 * 
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         password:
 *           type: string
 *           example: password123
 * 
 *     RefreshTokenRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * 
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         fullName:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           example: user
 *         isVerified:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2026-02-09T10:00:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2026-02-09T10:00:00Z
 * 
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Login successful
 *         data:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             refreshToken:
 *               type: string
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             user:
 *               $ref: '#/components/schemas/User'
 * 
 *     RegisterUserResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: User registered successfully
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 * 
 *     UsersListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Users retrieved successfully
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Error message
 *         errorCode:
 *           type: string
 *           example: INTERNAL_ERROR
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

export {};
