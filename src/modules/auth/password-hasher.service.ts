import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;
const PEPPER = process.env.PASSWORD_PEPPER ?? 'playsync_secret_pepper_v1';

/**
 * Hasher service that combines bcrypt + application-level pepper.
 * The pepper is never stored in the DB — it lives only in env config.
 */
export class PasswordHasher {
  private static applyPepper(raw: string): string {
    return `${raw}:${PEPPER}`;
  }

  static async hash(plainText: string): Promise<string> {
    const peppered = PasswordHasher.applyPepper(plainText);
    return bcrypt.hash(peppered, BCRYPT_ROUNDS);
  }

  static async verify(plainText: string, hashed: string): Promise<boolean> {
    const peppered = PasswordHasher.applyPepper(plainText);
    return bcrypt.compare(peppered, hashed);
  }

  static async needsRehash(hashed: string): Promise<boolean> {
    const currentRounds = bcrypt.getRounds(hashed);
    return currentRounds < BCRYPT_ROUNDS;
  }

  static generateTemporaryPassword(length = 12): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }
}
