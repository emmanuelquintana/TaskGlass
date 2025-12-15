import { randomBytes } from 'crypto';

export function generateTraceId(): string {
  return randomBytes(8).toString('hex');
}
