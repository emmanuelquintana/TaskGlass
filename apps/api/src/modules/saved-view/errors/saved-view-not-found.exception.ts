import { HttpStatus } from '@nestjs/common';
import { AppException } from '../../../common/errors/app.exception';
import { errorCodes } from '../../../common/errors/error-codes';

export class SavedViewNotFoundException extends AppException {
  constructor() {
    super(errorCodes.savedView.notFound, 'Saved view not found', HttpStatus.NOT_FOUND);
  }
}
