import { HttpStatus } from '@nestjs/common';
import { AppException } from '../../../common/errors/app.exception';
import { errorCodes } from '../../../common/errors/error-codes';

export class SavedViewAlreadyExistsException extends AppException {
  constructor() {
    super(errorCodes.savedView.alreadyExists, 'Saved view already exists', HttpStatus.CONFLICT);
  }
}
