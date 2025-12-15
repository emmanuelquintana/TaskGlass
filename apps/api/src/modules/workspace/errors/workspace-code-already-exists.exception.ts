import { HttpStatus } from '@nestjs/common';
import { AppException } from '../../../common/errors/app.exception';
import { errorCodes } from '../../../common/errors/error-codes';

export class WorkspaceCodeAlreadyExistsException extends AppException {
    constructor() {
        super(errorCodes.workspace.conflict, 'Workspace code already exists', HttpStatus.CONFLICT);
    }
}
