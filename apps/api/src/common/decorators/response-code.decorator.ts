import { SetMetadata } from '@nestjs/common';

export const RESPONSE_CODE_KEY = 'responseCode';

export function ResponseCode(code: string): MethodDecorator {
  return SetMetadata(RESPONSE_CODE_KEY, code);
}
