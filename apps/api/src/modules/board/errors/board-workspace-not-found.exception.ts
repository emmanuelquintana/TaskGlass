import { HttpStatus } from '@nestjs/common';
import { AppException } from '../../../common/errors/app.exception';
import { errorCodes } from '../../../common/errors/error-codes';

/**
 * BoardWorkspaceNotFoundException is thrown when the board is requested for a workspace that does not exist.
 */
export class BoardWorkspaceNotFoundException extends AppException {
    constructor() {
        super(errorCodes.board.workspaceNotFound, 'Workspace not found', HttpStatus.NOT_FOUND);
    }
}
