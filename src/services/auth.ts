import { UserAccount } from '../types/game';

const STORAGE_USERS_KEY = 'awf_registered_users_v1';
const STORAGE_CURRENT_USER_KEY = 'awf_active_user_v1';
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export interface OtpDeliveryEvent {
  email: string;
  code: string;
  expiresAt: number;
}

type OtpListener = (event: OtpDeliveryEvent) => void;
const otpListeners: Set<OtpListener> = new Set();

export function onOtpDelivered(listener: OtpListener) {
  otpListeners.add(listener);
  return () => otpListeners.delete(listener);
}

function notifyOtp(event: OtpDeliveryEvent) {
  otpListeners.forEach(fn => fn(event));
}

// Simple hash simulation for local client storage (non-plain text)
function simpleHash(pwd: string): string {
  let hash = 0;
  for (let i = 0; i < pwd.length; i++) {
    const char = pwd.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + pwd.length;
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function loadUsers(): Record<string, UserAccount & { passwordHash: string }> {
  try {
    const data = localStorage.getItem(STORAGE_USERS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading users', e);
  }
  return {};
}

function saveUsers(users: Record<string, UserAccount & { passwordHash: string }>) {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users', e);
  }
}

export class AuthService {
  /**
   * Get currently authenticated user if verified
   */
  public getCurrentUser(): UserAccount | null {
    try {
      const data = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      if (data) {
        const user = JSON.parse(data) as UserAccount;
        if (user.isVerified) {
          return user;
        }
      }
    } catch (e) {
      console.error('Error loading active user', e);
    }
    return null;
  }

  /**
   * Validate email format
   */
  public isValidEmail(email: string): boolean {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email.trim());
  }

  /**
   * Register a new user and generate OTP for email verification
   */
  public register(email: string, password: string, name?: string): { success: boolean; error?: string; user?: UserAccount; otp?: string } {
    const cleanEmail = email.trim().toLowerCase();
    
    if (!this.isValidEmail(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address (e.g. name@example.com).' };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const users = loadUsers();
    if (users[cleanEmail] && users[cleanEmail].isVerified) {
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + OTP_EXPIRY_MS;
    const defaultName = name?.trim() || cleanEmail.split('@')[0];

    const newUser: UserAccount & { passwordHash: string } = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      email: cleanEmail,
      name: defaultName,
      isVerified: false,
      otpCode: otp,
      otpExpiresAt: expiresAt,
      createdAt: Date.now(),
      passwordHash: simpleHash(password),
      stats: {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        highestScore: 0,
      },
    };

    users[cleanEmail] = newUser;
    saveUsers(users);

    // Notify listeners of OTP delivery
    notifyOtp({
      email: cleanEmail,
      code: otp,
      expiresAt,
    });

    return {
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        isVerified: false,
        createdAt: newUser.createdAt,
        stats: newUser.stats,
      },
      otp,
    };
  }

  /**
   * Verify email using the 6-digit OTP
   */
  public verifyOtp(email: string, enteredOtp: string): { success: boolean; error?: string; user?: UserAccount } {
    const cleanEmail = email.trim().toLowerCase();
    const users = loadUsers();
    const user = users[cleanEmail];

    if (!user) {
      return { success: false, error: 'User account not found. Please register first.' };
    }

    // Already-verified accounts only skip the code when no code is pending.
    if (user.isVerified && !user.otpCode) {
      return { success: true, user };
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      return { success: false, error: 'No active OTP request found. Please request a new code.' };
    }

    if (Date.now() > user.otpExpiresAt) {
      return { success: false, error: 'The verification code has expired. Please click Resend Code.' };
    }

    if (user.otpCode !== enteredOtp.trim()) {
      return { success: false, error: 'Incorrect verification code. Please check and try again.' };
    }

    // Success: Mark verified
    user.isVerified = true;
    delete user.otpCode;
    delete user.otpExpiresAt;
    users[cleanEmail] = user;
    saveUsers(users);

    const activeUser: UserAccount = {
      id: user.id,
      email: user.email,
      name: user.name,
      isVerified: true,
      createdAt: user.createdAt,
      stats: user.stats,
    };
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(activeUser));

    return { success: true, user: activeUser };
  }

  /**
   * Passwordless entry: creates the account on first use and sends a 6-digit code to the email.
   */
  public requestEmailCode(email: string): { success: boolean; error?: string; otp?: string; expiresAt?: number } {
    const cleanEmail = email.trim().toLowerCase();
    if (!this.isValidEmail(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address (e.g. name@example.com).' };
    }

    const users = loadUsers();
    if (!users[cleanEmail]) {
      users[cleanEmail] = {
        id: 'usr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        isVerified: false,
        createdAt: Date.now(),
        passwordHash: '',
        stats: { gamesPlayed: 0, wins: 0, losses: 0, ties: 0, highestScore: 0 },
      };
      saveUsers(users);
    }

    return this.resendOtp(cleanEmail);
  }

  /**
   * Resend a fresh OTP code to user's email
   */
  public resendOtp(email: string): { success: boolean; error?: string; otp?: string; expiresAt?: number } {
    const cleanEmail = email.trim().toLowerCase();
    const users = loadUsers();
    const user = users[cleanEmail];

    if (!user) {
      return { success: false, error: 'User not found. Please register first.' };
    }

    const newOtp = generateOtp();
    const expiresAt = Date.now() + OTP_EXPIRY_MS;

    user.otpCode = newOtp;
    user.otpExpiresAt = expiresAt;
    users[cleanEmail] = user;
    saveUsers(users);

    notifyOtp({
      email: cleanEmail,
      code: newOtp,
      expiresAt,
    });

    return { success: true, otp: newOtp, expiresAt };
  }

  /**
   * Log in with Email and Password
   */
  public login(email: string, password: string): { success: boolean; error?: string; user?: UserAccount; needsVerification?: boolean } {
    const cleanEmail = email.trim().toLowerCase();
    const users = loadUsers();
    const user = users[cleanEmail];

    if (!user) {
      return { success: false, error: 'No account found with this email. Please check your spelling or register.' };
    }

    if (user.passwordHash !== simpleHash(password)) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    if (!user.isVerified) {
      // Re-trigger OTP
      this.resendOtp(cleanEmail);
      return {
        success: false,
        needsVerification: true,
        error: 'Email address not yet verified. Please enter the OTP sent to your email.',
        user,
      };
    }

    const activeUser: UserAccount = {
      id: user.id,
      email: user.email,
      name: user.name,
      isVerified: true,
      createdAt: user.createdAt,
      stats: user.stats,
    };
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(activeUser));

    return { success: true, user: activeUser };
  }

  /**
   * Log out active session
   */
  public logout() {
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  }

  /**
   * Update stats after game finishes
   */
  public recordGameResult(userEmail: string, result: 'win' | 'loss' | 'tie', score: number): UserAccount | null {
    const cleanEmail = userEmail.trim().toLowerCase();
    const users = loadUsers();
    const user = users[cleanEmail];
    if (!user) return null;

    user.stats.gamesPlayed += 1;
    if (result === 'win') user.stats.wins += 1;
    else if (result === 'loss') user.stats.losses += 1;
    else user.stats.ties += 1;

    if (score > user.stats.highestScore) {
      user.stats.highestScore = score;
    }

    users[cleanEmail] = user;
    saveUsers(users);

    const activeUser: UserAccount = {
      id: user.id,
      email: user.email,
      name: user.name,
      isVerified: true,
      createdAt: user.createdAt,
      stats: user.stats,
    };
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(activeUser));
    return activeUser;
  }
}

export const authService = new AuthService();
