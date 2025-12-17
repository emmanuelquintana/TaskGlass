import { HttpStatus } from '@nestjs/common';
import { AppException } from '../../../common/errors/app.exception';
import { errorCodes } from '../../../common/errors/error-codes';

export class ColumnNotFoundException extends AppException {
    constructor() {
        super(errorCodes.column.notFound, 'Column not found', HttpStatus.NOT_FOUND);
    }
}
