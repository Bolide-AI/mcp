import { dirname } from 'path';
import { ValidationError } from './errors.js';
import { log } from './logger.js';

export const getWorkspacePath = () => {
  let workspacePath = process.env.WORKSPACE_FOLDER_PATHS;

  if (!workspacePath) {
    throw new ValidationError('WORKSPACE_FOLDER_PATHS is not set');
  }

  if (workspacePath.includes(',')) {
    log(
      'info',
      `Workspace path contains multiple paths, resolving workspace path from the first path`,
    );

    workspacePath = dirname(workspacePath.split(',')[0]);
  }

  return workspacePath;
};
