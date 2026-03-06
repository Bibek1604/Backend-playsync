import { Request, Response } from 'express';
import { userService } from '../mocks';

/**
 * Mock User Controller
 */
export const userController = {
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
