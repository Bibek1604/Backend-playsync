/**
 * Shared Mock Modules
 * Used across all test files
 */

// Mock Database Module
export const mockDb = {
  getUserById: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  findUserByEmail: jest.fn(),
  getAllUsers: jest.fn(),
};

// Utility Functions
export const utils = {
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
    return `hashed_${password}`;
  },
  
  comparePasswords: (plain: string, hashed: string): boolean => {
    return `hashed_${plain}` === hashed;
  },
};

// User Service
export const userService = {
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

// Auth Service
export const authService = {
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
