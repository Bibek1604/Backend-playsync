import { Request, Response } from 'express';
import { authService } from '../mocks';

/**
 * Mock Auth Controller
 */
export const authController = {
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
