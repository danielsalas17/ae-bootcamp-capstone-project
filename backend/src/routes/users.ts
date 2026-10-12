import { Router } from 'express';
import { getOrCreateUser, findUserById } from '../services/userService';

export const usersRouter = Router();

usersRouter.post('/', (req, res) => {
  const { username } = req.body as { username?: string };
  if (!username || !username.trim()) {
    res.status(400).json({ error: 'username is required' });
    return;
  }
  const user = getOrCreateUser(username.trim());
  res.status(200).json(user);
});

usersRouter.get('/:userId', (req, res) => {
  const user = findUserById(req.params.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
});
