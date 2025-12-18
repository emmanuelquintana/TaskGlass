export const errorCodes = {
  core: {
    badRequest: 'TG_CORE_400',
    unauthorized: 'TG_CORE_401',
    forbidden: 'TG_CORE_403',
    notFound: 'TG_CORE_404',
    internalServerError: 'TG_CORE_500'
  },
  workspace: {
    notFound: 'TG_WS_404',
    conflict: 'TG_WS_409'
  },
  column: {
    notFound: 'TG_COL_404'
  },
  task: {
    notFound: 'TG_TS_404'
  }
} as const;
