import { HttpStatus } from '@nestjs/common';
import { AppException } from '../../../common/errors/app.exception';
import { errorCodes } from '../../../common/errors/error-codes';

export class TagNotFoundException extends AppException {
  constructor() {
    super(errorCodes.tag.notFound, 'Tag not found', HttpStatus.NOT_FOUND);
  }
}
