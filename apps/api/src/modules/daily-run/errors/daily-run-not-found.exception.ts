import { HttpStatus } from '@nestjs/common';
import { AppException } from '../../../common/errors/app.exception';
import { errorCodes } from '../../../common/errors/error-codes';

export class DailyRunNotFoundException extends AppException {
  constructor() {
    super(errorCodes.dailyRun.notFound, 'Daily run not found', HttpStatus.NOT_FOUND);
  }
}
