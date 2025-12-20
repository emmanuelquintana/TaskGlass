import { HttpStatus } from '@nestjs/common';
import { AppException } from '../../../common/errors/app.exception';
import { errorCodes } from '../../../common/errors/error-codes';

export class TaskTagWorkspaceMismatchException extends AppException {
  constructor() {
    super(errorCodes.taskTag.workspaceMismatch, 'Task and tag must belong to the same workspace', HttpStatus.BAD_REQUEST);
  }
}
