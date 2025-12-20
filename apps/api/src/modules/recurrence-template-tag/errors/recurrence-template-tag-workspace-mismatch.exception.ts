import { HttpStatus } from '@nestjs/common';
import { AppException } from '../../../common/errors/app.exception';
import { errorCodes } from '../../../common/errors/error-codes';

/**
 * Thrown when a tag and a recurrence template do not belong to the same workspace.
 */
export class RecurrenceTemplateTagWorkspaceMismatchException extends AppException {
  constructor() {
    super(
      errorCodes.recurrenceTemplateTag.workspaceMismatch,
      'Recurrence template and tag must belong to the same workspace',
      HttpStatus.BAD_REQUEST
    );
  }
}
