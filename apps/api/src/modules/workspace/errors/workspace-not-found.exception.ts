import { HttpStatus } from '@nestjs/common';
import { AppException } from '../../../common/errors/app.exception';
import { errorCodes } from '../../../common/errors/error-codes';

export class WorkspaceNotFoundException extends AppException {
  constructor() {
    super(errorCodes.workspace.notFound, 'Workspace not found', HttpStatus.NOT_FOUND);
  }
}
