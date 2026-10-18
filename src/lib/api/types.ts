/** Approved TAL-4 wire contract. Types only: no invoke SDK or runtime providers.
 * String aliases preserve JSON representation; Rust providers must validate
 * UUID/date/timezone/title/revision semantics at their boundary.
 */
export type Id = string;
declare const idRole: unique symbol;
export type TaskId = string & { readonly [idRole]: 'task' };
export type CompletionId = string & { readonly [idRole]: 'completion' };
export type UndoToken = string & { readonly [idRole]: 'undo' };
export type PreviewToken = string & { readonly [idRole]: 'preview' };
export type Day = string;
export type UtcInstant = string;
export type Timezone = string;
export type Revision = string;
export type Theme = 'system' | 'light' | 'dark';
export type TaskTarget =
  { kind: 'today' } | { kind: 'day'; day: Day } | { kind: 'later' };
export type TaskView =
  { kind: 'day'; day: Day } | { kind: 'later' } | { kind: 'pending' };
export type UndoAction =
  'create' | 'edit' | 'move' | 'complete' | 'reopen' | 'delete';
export type UndoDto = { token: UndoToken; action: UndoAction };
export type ContextDto = {
  revision: Revision;
  today: Day;
  reportingTimezone: Timezone;
  timezoneFallback: boolean;
  undo: UndoDto | null;
};
export type TaskDto = {
  id: TaskId;
  title: string;
  plannedDay: Day | null;
  completed: boolean;
  createdAt: UtcInstant;
  updatedAt: UtcInstant;
};
export type HistoryItemDto = {
  completionId: CompletionId;
  taskId: TaskId;
  titleSnapshot: string;
  plannedDaySnapshot: Day | null;
  completedAt: UtcInstant;
  completedDay: Day;
  completionTimezone: Timezone;
  taskDeleted: boolean;
};
/** Shape only: provider validates integer limit 1..200 and null revision => offset 0.
 * Use VALIDATION_ERROR at page.limit/page.offset before querying. */
export type PageRequest = {
  offset: number;
  limit: number;
  revision: Revision | null;
};
export type PageDto<T> = {
  items: T[];
  total: number;
  nextOffset: number | null;
};
export type TaskMutationDto = {
  context: ContextDto;
  taskId: TaskId;
  changed: boolean;
};
export type SettingsDto = {
  theme: Theme;
  reportingTimezone: Timezone;
  timezoneFallback: boolean;
};
export type RecoveryBackupDto = { path: string; completedAt: UtcInstant };
export type ErrorOutcome = 'notApplied' | 'unknown' | 'notApplicable';
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'TASK_DELETED'
  | 'ID_CONFLICT'
  | 'REVISION_CONFLICT'
  | 'UNDO_UNAVAILABLE'
  | 'PREVIEW_EXPIRED'
  | 'IMPORT_TOO_LARGE'
  | 'UNSUPPORTED_FORMAT'
  | 'INVALID_BACKUP'
  | 'BACKUP_FAILED'
  | 'FILE_IO_ERROR'
  | 'STORAGE_BUSY'
  | 'STORAGE_ERROR'
  | 'IPC_UNAVAILABLE'
  | 'INTERNAL_ERROR'
  // Reserved for desktop provider review; not callable desktop adapters.
  | 'DESKTOP_UNSUPPORTED'
  | 'DESKTOP_ERROR';
export type IpcError = {
  code: ErrorCode;
  message: string;
  field: string | null;
  retryable: boolean;
  outcome: ErrorOutcome;
  recoveryBackup: RecoveryBackupDto | null;
};
export type EmptyRequest = Record<string, never>;
export type CreateTaskRequest = {
  id: TaskId;
  title: string;
  target: TaskTarget;
  completed: boolean;
  expectedRevision: Revision;
};
export type EditTaskRequest = {
  taskId: TaskId;
  title: string;
  expectedRevision: Revision;
};
export type MoveTaskRequest = {
  taskId: TaskId;
  target: TaskTarget;
  expectedRevision: Revision;
};
export type TaskIdRequest = { taskId: TaskId; expectedRevision: Revision };
export type UndoLastRequest = { token: UndoToken; expectedRevision: Revision };
export type ListTasksRequest = { view: TaskView; page: PageRequest };
export type GetStatsRequest = {
  fromDay: Day;
  toDay: Day;
  revision: Revision | null;
};
export type ListHistoryRequest = { day: Day; page: PageRequest };
export type SetThemeRequest = { theme: Theme; expectedRevision: Revision };
export type RestoreDataRequest = {
  previewToken: PreviewToken;
  confirmed: true;
  expectedRevision: Revision;
};
export type ListTasksDto = {
  context: ContextDto;
  page: PageDto<TaskDto>;
  pendingCount: number;
};
export type DayCountDto = { day: Day; count: number };
export type StatsDto = {
  context: ContextDto;
  fromDay: Day;
  toDay: Day;
  days: DayCountDto[];
  total: number;
};
export type ListHistoryDto = {
  context: ContextDto;
  day: Day;
  page: PageDto<HistoryItemDto>;
};
export type GetSettingsDto = { context: ContextDto; settings: SettingsDto };
export type SetThemeDto = GetSettingsDto & { changed: boolean };
export type ExportDataDto =
  | { status: 'cancelled' }
  | { status: 'exported'; path: string; revision: Revision; formatVersion: 1 };
export type RestorePreviewDto =
  | { status: 'cancelled' }
  | {
      status: 'ready';
      previewToken: PreviewToken;
      fileName: string;
      formatVersion: 1;
      taskCount: number;
      completionCount: number;
      reportingTimezone: Timezone;
      theme: Theme;
      expiresAt: UtcInstant;
      replacesAllData: true;
    };
export type RestoreDataDto = {
  context: ContextDto;
  backupPath: string;
  taskCount: number;
  completionCount: number;
};
export type RestoreRecoveryDto = {
  backupDirectory: string;
  latestBackup: RecoveryBackupDto | null;
};

/** A compile-time catalogue, not a command bus or availability registry.
 * None of these business providers exist yet. Consumers must keep their
 * features unavailable; fixtures must never serve as an invoke fallback.
 * Desktop request types remain owned by the future desktop provider ticket.
 */
export type CommandRequests = {
  get_context: EmptyRequest;
  list_tasks: ListTasksRequest;
  create_task: CreateTaskRequest;
  edit_task: EditTaskRequest;
  move_task: MoveTaskRequest;
  complete_task: TaskIdRequest;
  reopen_task: TaskIdRequest;
  delete_task: TaskIdRequest;
  undo_last: UndoLastRequest;
  get_stats: GetStatsRequest;
  list_history: ListHistoryRequest;
  get_settings: EmptyRequest;
  set_theme: SetThemeRequest;
  export_data: EmptyRequest;
  preview_restore: EmptyRequest;
  restore_data: RestoreDataRequest;
  get_restore_recovery: EmptyRequest;
};
export type CommandResponses = {
  get_context: ContextDto;
  list_tasks: ListTasksDto;
  create_task: TaskMutationDto;
  edit_task: TaskMutationDto;
  move_task: TaskMutationDto;
  complete_task: TaskMutationDto;
  reopen_task: TaskMutationDto;
  delete_task: TaskMutationDto;
  undo_last: TaskMutationDto;
  get_stats: StatsDto;
  list_history: ListHistoryDto;
  get_settings: GetSettingsDto;
  set_theme: SetThemeDto;
  export_data: ExportDataDto;
  preview_restore: RestorePreviewDto;
  restore_data: RestoreDataDto;
  get_restore_recovery: RestoreRecoveryDto;
};
export type CommandName = keyof CommandRequests;
export type CommandArgs<K extends CommandName> = {
  request: CommandRequests[K];
};
export type CommandFixture = {
  [K in CommandName]: {
    command: K;
    args: CommandArgs<K>;
    response: CommandResponses[K];
  };
}[CommandName];
export type FixtureSet = {
  cases: CommandFixture[];
  errors: IpcError[];
  samples: {
    task: TaskDto;
    history: HistoryItemDto;
    titles: { nfc: string; nfd: string; emoji500: string; emoji501: string };
  };
};
