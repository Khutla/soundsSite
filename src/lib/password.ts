import bcrypt from "bcryptjs";

export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateNewPassword(password: string): string | null {
  if (typeof password !== "string" || password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  return null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
