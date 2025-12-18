import { HttpStatus } from '@nestjs/common';
import { AppException } from '../../../common/errors/app.exception';
import { errorCodes } from '../../../common/errors/error-codes';

export class RecurrenceTemplateNotFoundException extends AppException {
  constructor() {
    super(errorCodes.recurrenceTemplate.notFound, 'Recurrence template not found', HttpStatus.NOT_FOUND);
  }
}
