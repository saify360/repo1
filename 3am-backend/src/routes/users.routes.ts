import express, { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { z } from 'zod';

const router = express.Router();

const CreateUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50).regex(/^[a-z0-9_]+$/),
  display_name: z.string().min(1).max(100),
  password: z.string().min(8),
  role: z.enum(['viewer', 'creator']).optional()
});

// Create user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const data = CreateUserSchema.parse(req.body);
    const user = await UserService.createUser(data);
    res.status(201).json({ success: true, user });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get user profile
router.get('/:username', async (req: Request, res: Response) => {
  try {
    const user = await UserService.getUserByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upgrade to creator
router.post('/:userId/upgrade', async (req: Request, res: Response) => {
  try {
    await UserService.upgradeToCreator(req.params.userId);
    res.json({ success: true, message: 'Upgraded to creator' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update profile
router.put('/:userId', async (req: Request, res: Response) => {
  try {
    const user = await UserService.updateProfile(req.params.userId, req.body);
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
