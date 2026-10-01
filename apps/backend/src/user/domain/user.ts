export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string | null;
  passwordHash: string | null;
  displayName: string | null;
  role: UserRole;
  isGuest: boolean;
}
