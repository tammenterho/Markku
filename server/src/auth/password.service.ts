import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';

const CLIENT_HASH_PREFIX = 'sha256:';
const SHA256_HEX_REGEX = /^[a-f0-9]{64}$/i;

type CredentialCompareResult = {
  isValid: boolean;
  usedLegacy: boolean;
};

@Injectable()
export class PasswordService {
  private readonly saltRounds = 12;

  private sha256(value: string): string {
    return createHash('sha256').update(value, 'utf8').digest('hex');
  }

  private normalizeCredential(value: string): string {
    if (value.startsWith(CLIENT_HASH_PREFIX)) {
      const digest = value.slice(CLIENT_HASH_PREFIX.length).toLowerCase();
      if (SHA256_HEX_REGEX.test(digest)) {
        return digest;
      }
    }

    return this.sha256(value);
  }

  isClientHashedCredential(value: string): boolean {
    if (!value.startsWith(CLIENT_HASH_PREFIX)) {
      return false;
    }

    return SHA256_HEX_REGEX.test(value.slice(CLIENT_HASH_PREFIX.length));
  }

  matchesUsernameCredential(username: string, credential: string): boolean {
    return this.sha256(username) === this.normalizeCredential(credential);
  }

  hash(password: string): Promise<string> {
    return bcrypt.hash(this.normalizeCredential(password), this.saltRounds);
  }

  compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async compareCredential(credential: string, hash: string): Promise<boolean> {
    const result = await this.compareCredentialDetailed(credential, hash);
    return result.isValid;
  }

  async compareCredentialDetailed(
    credential: string,
    hash: string,
  ): Promise<CredentialCompareResult> {
    const normalized = this.normalizeCredential(credential);

    if (await bcrypt.compare(normalized, hash)) {
      return { isValid: true, usedLegacy: false };
    }

    // Backwards compatibility for existing bcrypt(raw password) rows.
    const legacyValid = await bcrypt.compare(credential, hash);
    return { isValid: legacyValid, usedLegacy: legacyValid };
  }
}
