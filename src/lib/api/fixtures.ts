/** Test-only synthetic wire fixtures; never import into a runtime API fallback.
 * Each case is an independent request/response shape, not an executed lifecycle.
 * Rust and Vitest both check contract-fixtures.json against these typed values.
 */
import type {
  TaskId,
  CompletionId,
  UndoToken,
  PreviewToken,
  ContextDto,
  TaskDto,
  HistoryItemDto,
  SettingsDto,
  RecoveryBackupDto,
  TaskMutationDto,
  PageRequest,
  FixtureSet,
} from './types';
type FixtureIds = {
  task: TaskId;
  completion: CompletionId;
  undo: UndoToken;
  preview: PreviewToken;
};

function isCanonicalId<Role extends keyof FixtureIds>(
  value: string,
): value is FixtureIds[Role] {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
    value,
  );
}

/** Test-only validated narrowing: strings keep their exact JSON representation. */
export function fixtureId<Role extends keyof FixtureIds>(
  value: string,
): FixtureIds[Role] {
  if (!isCanonicalId<Role>(value))
    throw new Error('Fixture ID must be a canonical UUID');
  return value;
}

const context: ContextDto = {
  revision: '8',
  today: '2026-10-18',
  reportingTimezone: 'Asia/Ho_Chi_Minh',
  timezoneFallback: false,
  undo: null,
};
const task: TaskDto = {
  id: fixtureId<'task'>('11111111-1111-4111-8111-111111111111'),
  title: 'Đọc sách 📚',
  plannedDay: null,
  completed: false,
  createdAt: '2026-10-18T03:00:00.000Z',
  updatedAt: '2026-10-18T03:00:00.000Z',
};
const history: HistoryItemDto = {
  completionId: fixtureId<'completion'>('22222222-2222-4222-8222-222222222222'),
  taskId: fixtureId<'task'>('44444444-4444-4444-8444-444444444444'),
  titleSnapshot: 'Đọc sách 📚',
  plannedDaySnapshot: '2026-10-16',
  completedAt: '2026-10-18T03:00:00.000Z',
  completedDay: '2026-10-18',
  completionTimezone: 'Asia/Ho_Chi_Minh',
  taskDeleted: true,
};
const settings: SettingsDto = {
  theme: 'system',
  reportingTimezone: 'Asia/Ho_Chi_Minh',
  timezoneFallback: false,
};
const backup: RecoveryBackupDto = {
  path: '/home/demo/Tally-backups/before-restore-20261018-030000.json',
  completedAt: '2026-10-18T03:00:00.000Z',
};
const mutation: TaskMutationDto = {
  context: {
    revision: '9',
    today: '2026-10-18',
    reportingTimezone: 'Asia/Ho_Chi_Minh',
    timezoneFallback: false,
    undo: {
      token: fixtureId<'undo'>('33333333-3333-4333-8333-333333333333'),
      action: 'create',
    },
  },
  taskId: fixtureId<'task'>('11111111-1111-4111-8111-111111111111'),
  changed: true,
};
const firstPage: PageRequest = { offset: 0, limit: 100, revision: null };

export const contractFixtures = {
  cases: [
    { command: 'get_context', args: { request: {} }, response: context },
    {
      command: 'list_tasks',
      args: {
        request: { view: { kind: 'day', day: '2026-10-18' }, page: firstPage },
      },
      response: {
        context,
        page: { items: [], total: 0, nextOffset: null },
        pendingCount: 0,
      },
    },
    {
      command: 'list_tasks',
      args: { request: { view: { kind: 'later' }, page: firstPage } },
      response: {
        context,
        page: { items: [task], total: 1, nextOffset: null },
        pendingCount: 0,
      },
    },
    {
      command: 'list_tasks',
      args: { request: { view: { kind: 'pending' }, page: firstPage } },
      response: {
        context,
        page: { items: [], total: 0, nextOffset: null },
        pendingCount: 0,
      },
    },
    {
      command: 'create_task',
      args: {
        request: {
          id: fixtureId<'task'>('11111111-1111-4111-8111-111111111111'),
          title: '  Đọc sách 📚  ',
          target: { kind: 'today' },
          completed: true,
          expectedRevision: '8',
        },
      },
      response: mutation,
    },
    {
      command: 'create_task',
      args: {
        request: {
          id: fixtureId<'task'>('11111111-1111-4111-8111-111111111111'),
          title: '  Đọc sách 📚  ',
          target: { kind: 'day', day: '2026-10-16' },
          completed: true,
          expectedRevision: '8',
        },
      },
      response: mutation,
    },
    {
      command: 'create_task',
      args: {
        request: {
          id: fixtureId<'task'>('11111111-1111-4111-8111-111111111111'),
          title: '  Đọc sách 📚  ',
          target: { kind: 'later' },
          completed: true,
          expectedRevision: '8',
        },
      },
      response: mutation,
    },
    {
      command: 'edit_task',
      args: {
        request: {
          taskId: fixtureId<'task'>('11111111-1111-4111-8111-111111111111'),
          title: 'á',
          expectedRevision: '8',
        },
      },
      response: {
        ...mutation,
        context: {
          ...mutation.context,
          undo: {
            token: fixtureId<'undo'>('33333333-3333-4333-8333-333333333333'),
            action: 'edit',
          },
        },
      },
    },
    {
      command: 'move_task',
      args: {
        request: {
          taskId: fixtureId<'task'>('11111111-1111-4111-8111-111111111111'),
          target: { kind: 'today' },
          expectedRevision: '8',
        },
      },
      response: {
        ...mutation,
        context: {
          ...mutation.context,
          undo: {
            token: fixtureId<'undo'>('33333333-3333-4333-8333-333333333333'),
            action: 'move',
          },
        },
      },
    },
    {
      command: 'move_task',
      args: {
        request: {
          taskId: fixtureId<'task'>('11111111-1111-4111-8111-111111111111'),
          target: { kind: 'day', day: '2026-10-16' },
          expectedRevision: '8',
        },
      },
      response: {
        ...mutation,
        context: {
          ...mutation.context,
          undo: {
            token: fixtureId<'undo'>('33333333-3333-4333-8333-333333333333'),
            action: 'move',
          },
        },
      },
    },
    {
      command: 'move_task',
      args: {
        request: {
          taskId: fixtureId<'task'>('11111111-1111-4111-8111-111111111111'),
          target: { kind: 'later' },
          expectedRevision: '8',
        },
      },
      response: {
        ...mutation,
        context: {
          ...mutation.context,
          undo: {
            token: fixtureId<'undo'>('33333333-3333-4333-8333-333333333333'),
            action: 'move',
          },
        },
      },
    },
    {
      command: 'complete_task',
      args: {
        request: {
          taskId: fixtureId<'task'>('11111111-1111-4111-8111-111111111111'),
          expectedRevision: '8',
        },
      },
      response: {
        ...mutation,
        context: {
          ...mutation.context,
          undo: {
            token: fixtureId<'undo'>('33333333-3333-4333-8333-333333333333'),
            action: 'complete',
          },
        },
      },
    },
    {
      command: 'reopen_task',
      args: {
        request: {
          taskId: fixtureId<'task'>('11111111-1111-4111-8111-111111111111'),
          expectedRevision: '8',
        },
      },
      response: {
        ...mutation,
        context: {
          ...mutation.context,
          undo: {
            token: fixtureId<'undo'>('33333333-3333-4333-8333-333333333333'),
            action: 'reopen',
          },
        },
      },
    },
    {
      command: 'delete_task',
      args: {
        request: {
          taskId: fixtureId<'task'>('11111111-1111-4111-8111-111111111111'),
          expectedRevision: '8',
        },
      },
      response: {
        ...mutation,
        context: {
          ...mutation.context,
          undo: {
            token: fixtureId<'undo'>('33333333-3333-4333-8333-333333333333'),
            action: 'delete',
          },
        },
      },
    },
    {
      command: 'undo_last',
      args: {
        request: {
          token: fixtureId<'undo'>('33333333-3333-4333-8333-333333333333'),
          expectedRevision: '8',
        },
      },
      response: {
        context: { ...context, revision: '9' },
        taskId: task.id,
        changed: true,
      },
    },
    {
      command: 'get_stats',
      args: {
        request: { fromDay: '2026-10-16', toDay: '2026-10-18', revision: '8' },
      },
      response: {
        context,
        fromDay: '2026-10-16',
        toDay: '2026-10-18',
        days: [
          { day: '2026-10-16', count: 0 },
          { day: '2026-10-17', count: 0 },
          { day: '2026-10-18', count: 1 },
        ],
        total: 1,
      },
    },
    {
      command: 'list_history',
      args: { request: { day: '2026-10-18', page: firstPage } },
      response: {
        context,
        day: '2026-10-18',
        page: { items: [history], total: 1, nextOffset: null },
      },
    },
    {
      command: 'get_settings',
      args: { request: {} },
      response: { context, settings },
    },
    {
      command: 'set_theme',
      args: { request: { theme: 'system', expectedRevision: '8' } },
      response: {
        context: { ...context, revision: '8' },
        settings: { ...settings, theme: 'system' },
        changed: false,
      },
    },
    {
      command: 'set_theme',
      args: { request: { theme: 'light', expectedRevision: '8' } },
      response: {
        context: { ...context, revision: '9' },
        settings: { ...settings, theme: 'light' },
        changed: true,
      },
    },
    {
      command: 'set_theme',
      args: { request: { theme: 'dark', expectedRevision: '8' } },
      response: {
        context: { ...context, revision: '9' },
        settings: { ...settings, theme: 'dark' },
        changed: true,
      },
    },
    {
      command: 'export_data',
      args: { request: {} },
      response: { status: 'cancelled' },
    },
    {
      command: 'export_data',
      args: { request: {} },
      response: {
        status: 'exported',
        path: '/home/demo/export.json',
        revision: '8',
        formatVersion: 1,
      },
    },
    {
      command: 'preview_restore',
      args: { request: {} },
      response: { status: 'cancelled' },
    },
    {
      command: 'preview_restore',
      args: { request: {} },
      response: {
        status: 'ready',
        previewToken: fixtureId<'preview'>(
          '33333333-3333-4333-8333-333333333333',
        ),
        fileName: 'fixture.json',
        formatVersion: 1,
        taskCount: 1,
        completionCount: 1,
        reportingTimezone: 'Asia/Ho_Chi_Minh',
        theme: 'system',
        expiresAt: '2026-10-18T03:10:00.000Z',
        replacesAllData: true,
      },
    },
    {
      command: 'restore_data',
      args: {
        request: {
          previewToken: fixtureId<'preview'>(
            '33333333-3333-4333-8333-333333333333',
          ),
          confirmed: true,
          expectedRevision: '8',
        },
      },
      response: {
        context: { ...context, revision: '9' },
        backupPath: backup.path,
        taskCount: 1,
        completionCount: 1,
      },
    },
    {
      command: 'get_restore_recovery',
      args: { request: {} },
      response: {
        backupDirectory: '/home/demo/Tally-backups',
        latestBackup: null,
      },
    },
    {
      command: 'get_restore_recovery',
      args: { request: {} },
      response: {
        backupDirectory: '/home/demo/Tally-backups',
        latestBackup: backup,
      },
    },
  ],
  errors: [
    {
      code: 'VALIDATION_ERROR',
      message: 'Dữ liệu giả: thao tác chưa áp dụng.',
      field: 'page.offset',
      retryable: false,
      outcome: 'notApplied',
      recoveryBackup: null,
    },
    {
      code: 'NOT_FOUND',
      message: 'Dữ liệu giả: thao tác chưa áp dụng.',
      field: null,
      retryable: false,
      outcome: 'notApplied',
      recoveryBackup: null,
    },
    {
      code: 'TASK_DELETED',
      message: 'Dữ liệu giả: thao tác chưa áp dụng.',
      field: null,
      retryable: false,
      outcome: 'notApplied',
      recoveryBackup: null,
    },
    {
      code: 'ID_CONFLICT',
      message: 'Dữ liệu giả: thao tác chưa áp dụng.',
      field: null,
      retryable: false,
      outcome: 'notApplied',
      recoveryBackup: null,
    },
    {
      code: 'REVISION_CONFLICT',
      message: 'Dữ liệu giả: thao tác chưa áp dụng.',
      field: null,
      retryable: false,
      outcome: 'notApplied',
      recoveryBackup: null,
    },
    {
      code: 'UNDO_UNAVAILABLE',
      message: 'Dữ liệu giả: thao tác chưa áp dụng.',
      field: null,
      retryable: false,
      outcome: 'notApplied',
      recoveryBackup: null,
    },
    {
      code: 'PREVIEW_EXPIRED',
      message: 'Dữ liệu giả: thao tác chưa áp dụng.',
      field: null,
      retryable: false,
      outcome: 'notApplied',
      recoveryBackup: null,
    },
    {
      code: 'IMPORT_TOO_LARGE',
      message: 'Dữ liệu giả: thao tác chưa áp dụng.',
      field: null,
      retryable: false,
      outcome: 'notApplied',
      recoveryBackup: null,
    },
    {
      code: 'UNSUPPORTED_FORMAT',
      message: 'Dữ liệu giả: thao tác chưa áp dụng.',
      field: null,
      retryable: false,
      outcome: 'notApplied',
      recoveryBackup: null,
    },
    {
      code: 'INVALID_BACKUP',
      message: 'Dữ liệu giả: thao tác chưa áp dụng.',
      field: null,
      retryable: false,
      outcome: 'notApplied',
      recoveryBackup: null,
    },
    {
      code: 'BACKUP_FAILED',
      message: 'Dữ liệu giả: thao tác chưa áp dụng.',
      field: null,
      retryable: false,
      outcome: 'notApplied',
      recoveryBackup: null,
    },
    {
      code: 'FILE_IO_ERROR',
      message: 'Dữ liệu giả: thao tác chưa áp dụng.',
      field: null,
      retryable: false,
      outcome: 'notApplied',
      recoveryBackup: null,
    },
    {
      code: 'STORAGE_BUSY',
      message: 'Dữ liệu giả: thao tác chưa áp dụng.',
      field: null,
      retryable: true,
      outcome: 'notApplied',
      recoveryBackup: null,
    },
    {
      code: 'STORAGE_ERROR',
      message: 'Dữ liệu giả: thao tác chưa áp dụng.',
      field: null,
      retryable: false,
      outcome: 'notApplied',
      recoveryBackup: null,
    },
    {
      code: 'IPC_UNAVAILABLE',
      message: 'Dữ liệu giả: thao tác chưa áp dụng.',
      field: null,
      retryable: false,
      outcome: 'notApplied',
      recoveryBackup: null,
    },
    {
      code: 'INTERNAL_ERROR',
      message: 'Dữ liệu giả: thao tác chưa áp dụng.',
      field: null,
      retryable: false,
      outcome: 'notApplied',
      recoveryBackup: null,
    },
    {
      code: 'DESKTOP_UNSUPPORTED',
      message: 'Dữ liệu giả: thao tác chưa áp dụng.',
      field: null,
      retryable: false,
      outcome: 'notApplied',
      recoveryBackup: null,
    },
    {
      code: 'DESKTOP_ERROR',
      message: 'Dữ liệu giả: thao tác chưa áp dụng.',
      field: null,
      retryable: false,
      outcome: 'notApplied',
      recoveryBackup: null,
    },
    {
      code: 'IPC_UNAVAILABLE',
      message: 'Chưa xác định kết quả restore.',
      field: null,
      retryable: true,
      outcome: 'unknown',
      recoveryBackup: null,
    },
    {
      code: 'STORAGE_ERROR',
      message: 'Rollback đã xác nhận; backup được giữ.',
      field: null,
      retryable: false,
      outcome: 'notApplied',
      recoveryBackup: {
        path: '/home/demo/Tally-backups/before-restore-20261018-030000.json',
        completedAt: '2026-10-18T03:00:00.000Z',
      },
    },
    {
      code: 'IPC_UNAVAILABLE',
      message: 'Không tải được query.',
      field: null,
      retryable: true,
      outcome: 'notApplicable',
      recoveryBackup: null,
    },
  ],
  samples: {
    task,
    history,
    titles: {
      nfc: 'á',
      nfd: 'a\u0301',
      emoji500: '📚'.repeat(500),
      emoji501: '📚'.repeat(501),
    },
  },
} satisfies FixtureSet;
