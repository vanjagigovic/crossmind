export interface User {
  id: string;
  email: string | null;
  passwordHash: string | null;
  displayName: string | null;
  isGuest: boolean;
}