export interface AuthUser {
  externalId: string;
  email?: string | null;
  name?: string | null;
  imageUrl?: string | null;
}

export interface AuthState {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  user: AuthUser | null;
  getToken: (options?: { template?: string }) => Promise<string | null>;
  signOut: () => Promise<void>;
}
