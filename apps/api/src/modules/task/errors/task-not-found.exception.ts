import { HttpStatus } from '@nestjs/common';
import { AppException } from '../../../common/errors/app.exception';
import { errorCodes } from '../../../common/errors/error-codes';

export class TaskNotFoundException extends AppException {
  constructor() {
    super(errorCodes.task.notFound, 'Task not found', HttpStatus.NOT_FOUND);
  }
}
