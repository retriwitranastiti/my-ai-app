import { User, Proposal } from '../types';

const USERS_KEY = 'bapperida_users';
const PROPOSALS_KEY = 'bapperida_proposals';

export const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY);
  if (!users) {
    // Seed admin
    const admin: User = {
      id: 'admin-1',
      role: 'admin',
      name: 'Admin Bapperida',
      username: 'admin.bapperida',
      password: 'Bapperida2026!',
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([admin]));
    return [admin];
  }
  return JSON.parse(users);
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getProposals = (): Proposal[] => {
  const proposals = localStorage.getItem(PROPOSALS_KEY);
  return proposals ? JSON.parse(proposals) : [];
};

export const saveProposals = (proposals: Proposal[]) => {
  localStorage.setItem(PROPOSALS_KEY, JSON.stringify(proposals));
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem('bapperida_current_user');
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem('bapperida_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('bapperida_current_user');
  }
};
