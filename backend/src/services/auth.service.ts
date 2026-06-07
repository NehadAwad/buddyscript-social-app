import { AppDataSource } from "../config/database";
import { RefreshToken } from "../entities/RefreshToken";
import { User } from "../entities/User";
import { AppError } from "../utils/AppError";
import {
  getRefreshTokenExpiry,
  signAccessToken,
  verifyAccessToken,
} from "../utils/jwt";
import { hashPassword, verifyPassword } from "../utils/password";
import { generateRefreshToken, hashToken } from "../utils/tokens";
import { toPublicUser } from "../utils/userMapper";
import {
  assertLoginAllowed,
  clearLoginAttempts,
  recordFailedLogin,
} from "../utils/loginLockout";
import { LoginInput, RegisterInput } from "../validators/auth.validator";

export interface AuthResult {
  user: ReturnType<typeof toPublicUser>;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private readonly userRepository = AppDataSource.getRepository(User);
  private readonly refreshTokenRepository =
    AppDataSource.getRepository(RefreshToken);

  async register(input: RegisterInput): Promise<AuthResult> {
    const email = input.email.toLowerCase();

    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new AppError(409, "Email is already registered");
    }

    const passwordHash = await hashPassword(input.password);
    const user = this.userRepository.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email,
      passwordHash,
      avatarUrl: null,
    });

    await this.userRepository.save(user);
    return this.issueAuthTokens(user);
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const email = input.email.toLowerCase();
    assertLoginAllowed(email);

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      recordFailedLogin(email);
      throw new AppError(401, "Invalid email or password");
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      recordFailedLogin(email);
      throw new AppError(401, "Invalid email or password");
    }

    clearLoginAttempts(email);
    return this.issueAuthTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    const tokenHash = hashToken(refreshToken);
    const stored = await this.refreshTokenRepository.findOne({
      where: { tokenHash },
      relations: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) {
        await this.refreshTokenRepository.delete({ id: stored.id });
      }
      throw new AppError(401, "Invalid or expired refresh token");
    }

    await this.refreshTokenRepository.delete({ id: stored.id });
    return this.issueAuthTokens(stored.user);
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    const tokenHash = hashToken(refreshToken);
    await this.refreshTokenRepository.delete({ tokenHash });
  }

  async getCurrentUser(userId: string): Promise<ReturnType<typeof toPublicUser>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppError(401, "User not found");
    }
    return toPublicUser(user);
  }

  async resolveUserFromAccessToken(accessToken: string): Promise<User> {
    const payload = verifyAccessToken(accessToken);
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new AppError(401, "User not found");
    }

    return user;
  }

  private async issueAuthTokens(user: User): Promise<AuthResult> {
    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken();
    const refreshEntity = this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: getRefreshTokenExpiry(),
    });

    await this.refreshTokenRepository.save(refreshEntity);

    return {
      user: toPublicUser(user),
      accessToken,
      refreshToken,
    };
  }
}

export const authService = new AuthService();
