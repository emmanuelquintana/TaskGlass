import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  readonly code: string;

  constructor(code: string, message: string, status: HttpStatus) {
    super(message, status);
    this.code = code;
  }
}
