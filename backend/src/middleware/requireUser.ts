import type { RequestHandler } from 'express';
import { findUserById } from '../services/userService';

// Never trust a client-supplied userId without checking it exists first.
export const requireUser: RequestHandler = (req, res, next) => {
  const { userId } = req.params;
  const user = findUserById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  next();
};
