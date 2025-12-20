import { HttpStatus } from '@nestjs/common';
import { AppException } from '../../../common/errors/app.exception';
import { errorCodes } from '../../../common/errors/error-codes';

export class TagAlreadyExistsException extends AppException {
  constructor() {
    super(errorCodes.tag.alreadyExists, 'Tag already exists', HttpStatus.CONFLICT);
  }
}
