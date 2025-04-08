import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { User } from '../models/User';

export class TwoFactorAuthService {
  private static instance: TwoFactorAuthService;

  private constructor() {}

  public static getInstance(): TwoFactorAuthService {
    if (!TwoFactorAuthService.instance) {
      TwoFactorAuthService.instance = new TwoFactorAuthService();
    }
    return TwoFactorAuthService.instance;
  }

  public async generateSecret(user: User): Promise<{ secret: string; qrCodeUrl: string }> {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(
      user.email,
      'Whaticket',
      secret
    );

    const qrCodeUrl = await QRCode.toDataURL(otpauth);

    // Salvar o segredo no banco de dados
    user.twoFactorSecret = secret;
    user.twoFactorEnabled = false;
    await user.save();

    return { secret, qrCodeUrl };
  }

  public async verifyToken(user: User, token: string): Promise<boolean> {
    if (!user.twoFactorSecret) {
      throw new Error('2FA não está configurado para este usuário');
    }

    return authenticator.verify({
      token,
      secret: user.twoFactorSecret
    });
  }

  public async enable2FA(user: User, token: string): Promise<void> {
    const isValid = await this.verifyToken(user, token);

    if (!isValid) {
      throw new Error('Token 2FA inválido');
    }

    user.twoFactorEnabled = true;
    await user.save();
  }

  public async disable2FA(user: User, token: string): Promise<void> {
    const isValid = await this.verifyToken(user, token);

    if (!isValid) {
      throw new Error('Token 2FA inválido');
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    await user.save();
  }

  public async generateBackupCodes(user: User): Promise<string[]> {
    const codes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substr(2, 8).toUpperCase()
    );

    user.backupCodes = codes;
    await user.save();

    return codes;
  }

  public async verifyBackupCode(user: User, code: string): Promise<boolean> {
    if (!user.backupCodes || !user.backupCodes.length) {
      return false;
    }

    const isValid = user.backupCodes.includes(code);

    if (isValid) {
      // Remover o código usado
      user.backupCodes = user.backupCodes.filter(c => c !== code);
      await user.save();
    }

    return isValid;
  }

  public async validateLogin(user: User, token: string): Promise<boolean> {
    if (!user.twoFactorEnabled) {
      return true;
    }

    // Tentar validar com token 2FA
    const isValidToken = await this.verifyToken(user, token);
    if (isValidToken) {
      return true;
    }

    // Se o token não for válido, tentar com código de backup
    return this.verifyBackupCode(user, token);
  }
} 