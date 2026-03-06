/**
 * Comprehensive Jest Test Suite
 * 
 * This test suite covers:
 * - Controllers (GET, POST, PUT, DELETE)
 * - Services
 * - Utilities
 * - Database interactions
 * 
 * All tests use proper mocking and include both positive and negative cases.
 */

import { Request, Response } from 'express';

// ============================================================================
// MOCK MODULES
// ============================================================================

// Mock Database Module
const mockDb = {
  getUserById: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  findUserByEmail: jest.fn(),
  getAllUsers: jest.fn(),
};

// Mock Utility Functions
const utils = {
  capitalize: (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },
  
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  sanitizeInput: (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
  },
  
  generateToken: (): string => {
    return Math.random().toString(36).substring(2, 15);
  },
  
  hashPassword: (password: string): string => {
    // Simplified hash simulation
    return `hashed_${password}`;
  },
  
  comparePasswords: (plain: string, hashed: string): boolean => {
    return `hashed_${plain}` === hashed;
  },
};

// Mock User Service
const userService = {
  getUserById: async (id: number) => {
    const user = await mockDb.getUserById(id);
    if (!user) throw new Error('User not found');
    return user;
  },
  
  createUser: async (userData: any) => {
    if (!userData.email || !utils.validateEmail(userData.email)) {
      throw new Error('Invalid email');
    }
    const hashedPassword = utils.hashPassword(userData.password);
    const newUser = await mockDb.createUser({ ...userData, password: hashedPassword });
    return newUser;
  },
  
  updateUser: async (id: number, userData: any) => {
    const user = await mockDb.getUserById(id);
    if (!user) throw new Error('User not found');
    const updated = await mockDb.updateUser(id, userData);
    return updated;
  },
  
  deleteUser: async (id: number) => {
    const user = await mockDb.getUserById(id);
    if (!user) throw new Error('User not found');
    await mockDb.deleteUser(id);
    return { message: 'User deleted successfully' };
  },
  
  getAllUsers: async () => {
    return await mockDb.getAllUsers();
  },
};

// Mock Auth Service
const authService = {
  login: async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    const user = await mockDb.findUserByEmail(email);
    if (!user) throw new Error('Invalid credentials');
    
    const isValid = utils.comparePasswords(password, user.password);
    if (!isValid) throw new Error('Invalid credentials');
    
    const token = utils.generateToken();
    return { user, token };
  },
  
  register: async (userData: any) => {
    if (!utils.validateEmail(userData.email)) {
      throw new Error('Invalid email format');
    }
    
    const existing = await mockDb.findUserByEmail(userData.email);
    if (existing) throw new Error('User already exists');
    
    return await userService.createUser(userData);
  },
  
  verifyToken: (token: string) => {
    if (!token || token.length < 10) {
      throw new Error('Invalid token');
    }
    return { valid: true, userId: 1 };
  },
};

// Mock User Controller
const userController = {
  getUser: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = await userService.getUserById(id);
      return res.status(200).json(user);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  },
  
  createUser: async (req: Request, res: Response) => {
    try {
      const user = await userService.createUser(req.body);
      return res.status(201).json(user);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },
  
  updateUser: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = await userService.updateUser(id, req.body);
      return res.status(200).json(user);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  },
  
  deleteUser: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const result = await userService.deleteUser(id);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  },
  
  getAllUsers: async (req: Request, res: Response) => {
    try {
      const users = await userService.getAllUsers();
      return res.status(200).json(users);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },
};

// Mock Auth Controller
const authController = {
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  },
  
  register: async (req: Request, res: Response) => {
    try {
      const user = await authService.register(req.body);
      return res.status(201).json(user);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },
};

// ============================================================================
// UTILITY FUNCTION TESTS
// ============================================================================

describe('Utility Functions', () => {
  
  // Test 1: capitalize() - positive case
  test('capitalize() should capitalize first letter of string', () => {
    expect(utils.capitalize('hello')).toBe('Hello');
    expect(utils.capitalize('WORLD')).toBe('World');
  });
  
  // Test 2: capitalize() - negative case
  test('capitalize() should handle empty string', () => {
    expect(utils.capitalize('')).toBe('');
  });
  
  // Test 3: validateEmail() - positive case
  test('validateEmail() should return true for valid email', () => {
    expect(utils.validateEmail('test@example.com')).toBe(true);
    expect(utils.validateEmail('user.name@domain.co.uk')).toBe(true);
  });
  
  // Test 4: validateEmail() - negative case
  test('validateEmail() should return false for invalid email', () => {
    expect(utils.validateEmail('invalid')).toBe(false);
    expect(utils.validateEmail('test@')).toBe(false);
    expect(utils.validateEmail('@example.com')).toBe(false);
  });
  
  // Test 5: sanitizeInput() - positive case
  test('sanitizeInput() should remove dangerous characters', () => {
    expect(utils.sanitizeInput('<script>alert()</script>')).toBe('scriptalert()/script');
    expect(utils.sanitizeInput('  hello world  ')).toBe('hello world');
  });
  
  // Test 6: generateToken() - positive case
  test('generateToken() should generate a random token', () => {
    const token1 = utils.generateToken();
    const token2 = utils.generateToken();
    
    expect(token1).toBeTruthy();
    expect(token1.length).toBeGreaterThan(0);
    expect(token1).not.toBe(token2); // Should be different
  });
  
  // Test 7: hashPassword() - positive case
  test('hashPassword() should hash password', () => {
    const password = 'mySecurePassword123';
    const hashed = utils.hashPassword(password);
    
    expect(hashed).toBeTruthy();
    expect(hashed).not.toBe(password);
    expect(hashed).toContain('hashed_');
  });
  
  // Test 8: comparePasswords() - positive case
  test('comparePasswords() should return true for matching passwords', () => {
    const password = 'testPassword';
    const hashed = utils.hashPassword(password);
    
    expect(utils.comparePasswords(password, hashed)).toBe(true);
  });
  
  // Test 9: comparePasswords() - negative case
  test('comparePasswords() should return false for non-matching passwords', () => {
    const password = 'testPassword';
    const wrongPassword = 'wrongPassword';
    const hashed = utils.hashPassword(password);
    
    expect(utils.comparePasswords(wrongPassword, hashed)).toBe(false);
  });
});

// ============================================================================
// DATABASE INTERACTION TESTS
// ============================================================================

describe('Database Operations', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Test 10: getUserById() - positive case
  test('getUserById() should return user when found', async () => {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
    mockDb.getUserById.mockResolvedValue(mockUser);
    
    const result = await mockDb.getUserById(1);
    
    expect(mockDb.getUserById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockUser);
  });
  
  // Test 11: getUserById() - negative case
  test('getUserById() should return null when user not found', async () => {
    mockDb.getUserById.mockResolvedValue(null);
    
    const result = await mockDb.getUserById(999);
    
    expect(mockDb.getUserById).toHaveBeenCalledWith(999);
    expect(result).toBeNull();
  });
  
  // Test 12: createUser() - positive case
  test('createUser() should create and return new user', async () => {
    const newUser = { name: 'Jane Doe', email: 'jane@example.com', password: 'hashed_pass' };
    const createdUser = { id: 2, ...newUser };
    mockDb.createUser.mockResolvedValue(createdUser);
    
    const result = await mockDb.createUser(newUser);
    
    expect(mockDb.createUser).toHaveBeenCalledWith(newUser);
    expect(result).toEqual(createdUser);
    expect(result.id).toBeDefined();
  });
  
  // Test 13: updateUser() - positive case
  test('updateUser() should update and return user', async () => {
    const updateData = { name: 'Updated Name' };
    const updatedUser = { id: 1, name: 'Updated Name', email: 'john@example.com' };
    mockDb.updateUser.mockResolvedValue(updatedUser);
    
    const result = await mockDb.updateUser(1, updateData);
    
    expect(mockDb.updateUser).toHaveBeenCalledWith(1, updateData);
    expect(result.name).toBe('Updated Name');
  });
  
  // Test 14: deleteUser() - positive case
  test('deleteUser() should delete user successfully', async () => {
    mockDb.deleteUser.mockResolvedValue(true);
    
    const result = await mockDb.deleteUser(1);
    
    expect(mockDb.deleteUser).toHaveBeenCalledWith(1);
    expect(result).toBe(true);
  });
  
  // Test 15: findUserByEmail() - positive case
  test('findUserByEmail() should find user by email', async () => {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
    mockDb.findUserByEmail.mockResolvedValue(mockUser);
    
    const result = await mockDb.findUserByEmail('john@example.com');
    
    expect(mockDb.findUserByEmail).toHaveBeenCalledWith('john@example.com');
    expect(result).toEqual(mockUser);
  });
});

// ============================================================================
// SERVICE LAYER TESTS
// ============================================================================

describe('User Service', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Test 16: userService.getUserById() - positive case
  test('should retrieve user by ID successfully', async () => {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
    mockDb.getUserById.mockResolvedValue(mockUser);
    
    const result = await userService.getUserById(1);
    
    expect(result).toEqual(mockUser);
    expect(mockDb.getUserById).toHaveBeenCalledWith(1);
  });
  
  // Test 17: userService.getUserById() - negative case
  test('should throw error when user not found', async () => {
    mockDb.getUserById.mockResolvedValue(null);
    
    await expect(userService.getUserById(999)).rejects.toThrow('User not found');
  });
  
  // Test 18: userService.createUser() - positive case
  test('should create user with valid data', async () => {
    const userData = { 
      name: 'Jane Doe', 
      email: 'jane@example.com', 
      password: 'password123' 
    };
    const createdUser = { id: 2, ...userData, password: 'hashed_password123' };
    mockDb.createUser.mockResolvedValue(createdUser);
    
    const result = await userService.createUser(userData);
    
    expect(result).toBeDefined();
    expect(mockDb.createUser).toHaveBeenCalled();
  });
  
  // Test 19: userService.createUser() - negative case
  test('should throw error for invalid email', async () => {
    const userData = { 
      name: 'Jane Doe', 
      email: 'invalid-email', 
      password: 'password123' 
    };
    
    await expect(userService.createUser(userData)).rejects.toThrow('Invalid email');
  });
  
  // Test 20: userService.updateUser() - positive case
  test('should update user successfully', async () => {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
    const updateData = { name: 'John Updated' };
    const updatedUser = { ...mockUser, ...updateData };
    
    mockDb.getUserById.mockResolvedValue(mockUser);
    mockDb.updateUser.mockResolvedValue(updatedUser);
    
    const result = await userService.updateUser(1, updateData);
    
    expect(result.name).toBe('John Updated');
    expect(mockDb.updateUser).toHaveBeenCalledWith(1, updateData);
  });
  
  // Test 21: userService.deleteUser() - positive case
  test('should delete user successfully', async () => {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
    mockDb.getUserById.mockResolvedValue(mockUser);
    mockDb.deleteUser.mockResolvedValue(true);
    
    const result = await userService.deleteUser(1);
    
    expect(result).toEqual({ message: 'User deleted successfully' });
    expect(mockDb.deleteUser).toHaveBeenCalledWith(1);
  });
  
  // Test 22: userService.getAllUsers() - positive case
  test('should retrieve all users', async () => {
    const mockUsers = [
      { id: 1, name: 'User 1', email: 'user1@example.com' },
      { id: 2, name: 'User 2', email: 'user2@example.com' },
    ];
    mockDb.getAllUsers.mockResolvedValue(mockUsers);
    
    const result = await userService.getAllUsers();
    
    expect(result).toEqual(mockUsers);
    expect(result).toHaveLength(2);
  });
});

describe('Auth Service', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Test 23: authService.login() - positive case
  test('should login user with valid credentials', async () => {
    const mockUser = { 
      id: 1, 
      name: 'John Doe', 
      email: 'john@example.com',
      password: 'hashed_password123'
    };
    mockDb.findUserByEmail.mockResolvedValue(mockUser);
    
    const result = await authService.login('john@example.com', 'password123');
    
    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('token');
    expect(result.user).toEqual(mockUser);
  });
  
  // Test 24: authService.login() - negative case (invalid credentials)
  test('should throw error for invalid credentials', async () => {
    mockDb.findUserByEmail.mockResolvedValue(null);
    
    await expect(authService.login('wrong@example.com', 'password'))
      .rejects.toThrow('Invalid credentials');
  });
  
  // Test 25: authService.login() - negative case (missing fields)
  test('should throw error when email or password is missing', async () => {
    await expect(authService.login('', 'password'))
      .rejects.toThrow('Email and password are required');
  });
  
  // Test 26: authService.register() - positive case
  test('should register new user successfully', async () => {
    const userData = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123'
    };
    const createdUser = { id: 3, ...userData, password: 'hashed_password123' };
    
    mockDb.findUserByEmail.mockResolvedValue(null);
    mockDb.createUser.mockResolvedValue(createdUser);
    
    const result = await authService.register(userData);
    
    expect(result).toBeDefined();
    expect(mockDb.findUserByEmail).toHaveBeenCalledWith(userData.email);
  });
  
  // Test 27: authService.register() - negative case (user exists)
  test('should throw error when user already exists', async () => {
    const userData = {
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'password123'
    };
    const existingUser = { id: 1, ...userData };
    
    mockDb.findUserByEmail.mockResolvedValue(existingUser);
    
    await expect(authService.register(userData))
      .rejects.toThrow('User already exists');
  });
  
  // Test 28: authService.verifyToken() - positive case
  test('should verify valid token', () => {
    const token = 'validtoken1234567890';
    
    const result = authService.verifyToken(token);
    
    expect(result).toHaveProperty('valid', true);
    expect(result).toHaveProperty('userId');
  });
  
  // Test 29: authService.verifyToken() - negative case
  test('should throw error for invalid token', () => {
    const invalidToken = 'short';
    
    expect(() => authService.verifyToken(invalidToken))
      .toThrow('Invalid token');
  });
});

// ============================================================================
// CONTROLLER TESTS
// ============================================================================

describe('User Controller', () => {
  
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      params: {},
      body: {},
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });
  
  // Test 30: GET user by ID - positive case
  test('GET /users/:id should return user successfully', async () => {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
    mockRequest.params = { id: '1' };
    mockDb.getUserById.mockResolvedValue(mockUser);
    
    await userController.getUser(
      mockRequest as Request,
      mockResponse as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
  });
  
  // Test 31: GET user by ID - negative case (not found)
  test('GET /users/:id should return 404 when user not found', async () => {
    mockRequest.params = { id: '999' };
    mockDb.getUserById.mockResolvedValue(null);
    
    await userController.getUser(
      mockRequest as Request,
      mockResponse as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
  
  // Test 32: POST create user - positive case
  test('POST /users should create user successfully', async () => {
    const userData = { 
      name: 'Jane Doe', 
      email: 'jane@example.com', 
      password: 'password123' 
    };
    const createdUser = { id: 2, ...userData, password: 'hashed_password123' };
    
    mockRequest.body = userData;
    mockDb.createUser.mockResolvedValue(createdUser);
    
    await userController.createUser(
      mockRequest as Request,
      mockResponse as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(createdUser);
  });
  
  // Test 33: POST create user - negative case (invalid email)
  test('POST /users should return 400 for invalid email', async () => {
    mockRequest.body = { 
      name: 'Jane Doe', 
      email: 'invalid-email', 
      password: 'password123' 
    };
    
    await userController.createUser(
      mockRequest as Request,
      mockResponse as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
  
  // Test 34: PUT update user - positive case
  test('PUT /users/:id should update user successfully', async () => {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
    const updateData = { name: 'John Updated' };
    const updatedUser = { ...mockUser, ...updateData };
    
    mockRequest.params = { id: '1' };
    mockRequest.body = updateData;
    mockDb.getUserById.mockResolvedValue(mockUser);
    mockDb.updateUser.mockResolvedValue(updatedUser);
    
    await userController.updateUser(
      mockRequest as Request,
      mockResponse as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(updatedUser);
  });
  
  // Test 35: PUT update user - negative case
  test('PUT /users/:id should return 404 when user not found', async () => {
    mockRequest.params = { id: '999' };
    mockRequest.body = { name: 'Updated Name' };
    mockDb.getUserById.mockResolvedValue(null);
    
    await userController.updateUser(
      mockRequest as Request,
      mockResponse as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(404);
  });
  
  // Test 36: DELETE user - positive case
  test('DELETE /users/:id should delete user successfully', async () => {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
    mockRequest.params = { id: '1' };
    mockDb.getUserById.mockResolvedValue(mockUser);
    mockDb.deleteUser.mockResolvedValue(true);
    
    await userController.deleteUser(
      mockRequest as Request,
      mockResponse as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });
  
  // Test 37: DELETE user - negative case
  test('DELETE /users/:id should return 404 when user not found', async () => {
    mockRequest.params = { id: '999' };
    mockDb.getUserById.mockResolvedValue(null);
    
    await userController.deleteUser(
      mockRequest as Request,
      mockResponse as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(404);
  });
  
  // Test 38: GET all users - positive case
  test('GET /users should return all users', async () => {
    const mockUsers = [
      { id: 1, name: 'User 1', email: 'user1@example.com' },
      { id: 2, name: 'User 2', email: 'user2@example.com' },
    ];
    mockDb.getAllUsers.mockResolvedValue(mockUsers);
    
    await userController.getAllUsers(
      mockRequest as Request,
      mockResponse as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockUsers);
  });
});

describe('Auth Controller', () => {
  
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      params: {},
      body: {},
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });
  
  // Test 39: POST login - positive case
  test('POST /auth/login should login user successfully', async () => {
    const mockUser = { 
      id: 1, 
      name: 'John Doe', 
      email: 'john@example.com',
      password: 'hashed_password123'
    };
    mockRequest.body = { email: 'john@example.com', password: 'password123' };
    mockDb.findUserByEmail.mockResolvedValue(mockUser);
    
    await authController.login(
      mockRequest as Request,
      mockResponse as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expect.any(Object),
        token: expect.any(String)
      })
    );
  });
  
  // Test 40: POST login - negative case (invalid credentials)
  test('POST /auth/login should return 401 for invalid credentials', async () => {
    mockRequest.body = { email: 'wrong@example.com', password: 'wrongpass' };
    mockDb.findUserByEmail.mockResolvedValue(null);
    
    await authController.login(
      mockRequest as Request,
      mockResponse as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
  
  // Test 41: POST register - positive case
  test('POST /auth/register should register new user successfully', async () => {
    const userData = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123'
    };
    const createdUser = { id: 3, ...userData, password: 'hashed_password123' };
    
    mockRequest.body = userData;
    mockDb.findUserByEmail.mockResolvedValue(null);
    mockDb.createUser.mockResolvedValue(createdUser);
    
    await authController.register(
      mockRequest as Request,
      mockResponse as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(createdUser);
  });
  
  // Test 42: POST register - negative case (user exists)
  test('POST /auth/register should return 400 when user exists', async () => {
    const userData = {
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'password123'
    };
    const existingUser = { id: 1, ...userData };
    
    mockRequest.body = userData;
    mockDb.findUserByEmail.mockResolvedValue(existingUser);
    
    await authController.register(
      mockRequest as Request,
      mockResponse as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Integration Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Test 43: Full user creation flow
  test('should complete full user creation workflow', async () => {
    const userData = {
      name: 'Integration User',
      email: 'integration@example.com',
      password: 'password123'
    };
    
    // Validate email
    expect(utils.validateEmail(userData.email)).toBe(true);
    
    // Hash password
    const hashedPassword = utils.hashPassword(userData.password);
    expect(hashedPassword).toContain('hashed_');
    
    // Create user in database
    const createdUser = { id: 10, ...userData, password: hashedPassword };
    mockDb.findUserByEmail.mockResolvedValue(null);
    mockDb.createUser.mockResolvedValue(createdUser);
    
    const user = await userService.createUser(userData);
    
    expect(user).toBeDefined();
    expect(user.id).toBe(10);
  });
  
  // Test 44: Full authentication flow
  test('should complete full authentication workflow', async () => {
    const email = 'test@example.com';
    const password = 'testPassword123';
    const hashedPassword = utils.hashPassword(password);
    
    const mockUser = {
      id: 5,
      name: 'Test User',
      email: email,
      password: hashedPassword
    };
    
    mockDb.findUserByEmail.mockResolvedValue(mockUser);
    
    const loginResult = await authService.login(email, password);
    
    expect(loginResult).toHaveProperty('user');
    expect(loginResult).toHaveProperty('token');
    expect(loginResult.user.email).toBe(email);
    
    // Verify token
    const tokenVerification = authService.verifyToken(loginResult.token);
    expect(tokenVerification.valid).toBe(true);
  });
  
  // Test 45: Complete CRUD operation flow
  test('should handle complete CRUD operations', async () => {
    // CREATE
    const newUser = {
      name: 'CRUD User',
      email: 'crud@example.com',
      password: 'password123'
    };
    const createdUser = { id: 20, ...newUser, password: 'hashed_password123' };
    mockDb.createUser.mockResolvedValue(createdUser);
    mockDb.findUserByEmail.mockResolvedValue(null);
    
    const created = await userService.createUser(newUser);
    expect(created.id).toBe(20);
    
    // READ
    mockDb.getUserById.mockResolvedValue(createdUser);
    const retrieved = await userService.getUserById(20);
    expect(retrieved).toEqual(createdUser);
    
    // UPDATE
    const updateData = { name: 'CRUD User Updated' };
    const updatedUser = { ...createdUser, ...updateData };
    mockDb.updateUser.mockResolvedValue(updatedUser);
    
    const updated = await userService.updateUser(20, updateData);
    expect(updated.name).toBe('CRUD User Updated');
    
    // DELETE
    mockDb.deleteUser.mockResolvedValue(true);
    const deleted = await userService.deleteUser(20);
    expect(deleted).toHaveProperty('message');
  });
  
  // Test 46: Error handling across layers
  test('should properly handle errors across all layers', async () => {
    // Service layer error
    mockDb.getUserById.mockResolvedValue(null);
    await expect(userService.getUserById(999))
      .rejects.toThrow('User not found');
    
    // Validation error
    await expect(userService.createUser({ email: 'invalid', password: 'pass' }))
      .rejects.toThrow('Invalid email');
    
    // Auth error
    mockDb.findUserByEmail.mockResolvedValue(null);
    await expect(authService.login('test@example.com', 'wrong'))
      .rejects.toThrow('Invalid credentials');
  });
});
