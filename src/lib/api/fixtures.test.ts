import { describe, expect, it } from 'vitest';
import shared from './contract-fixtures.json';
import { contractFixtures, fixtureId } from './fixtures';
import type {
  CommandName,
  CommandRequests,
  IpcError,
  TaskId,
  CompletionId,
  UndoToken,
  PreviewToken,
} from './types';

describe('approved IPC fixtures (no runtime providers)', () => {
  it('keeps the typed TS fixture identical to the JSON read by Rust serde', () => {
    expect(contractFixtures).toEqual(shared);
  });

  it('covers every command and retains the request argument envelope', () => {
    const commands = [
      'get_context',
      'list_tasks',
      'create_task',
      'edit_task',
      'move_task',
      'complete_task',
      'reopen_task',
      'delete_task',
      'undo_last',
      'get_stats',
      'list_history',
      'get_settings',
      'set_theme',
      'export_data',
      'preview_restore',
      'restore_data',
      'get_restore_recovery',
    ] satisfies CommandName[];
    expect(new Set(contractFixtures.cases.map((item) => item.command))).toEqual(
      new Set(commands),
    );
    for (const item of contractFixtures.cases) {
      expect(Object.keys(item.args)).toEqual(['request']);
      expect(JSON.parse(JSON.stringify(item))).toEqual(item);
    }
  });

  it('preserves Unicode and explicit null without conflating planned and completed days', () => {
    const { task, history, titles } = contractFixtures.samples;
    expect(task.plannedDay).toBeNull();
    expect(history.plannedDaySnapshot).toBe('2026-10-16');
    expect(history.completedDay).toBe('2026-10-18');
    expect(history.completedAt).toBe('2026-10-18T03:00:00.000Z');
    expect(history.taskDeleted).toBe(true);
    expect(titles.nfc).not.toBe(titles.nfd);
    expect(titles.nfc.normalize('NFD')).toBe(titles.nfd);
    expect([...titles.emoji500]).toHaveLength(500);
    expect(titles.emoji500.length).toBe(1000);
    expect([...titles.emoji501]).toHaveLength(501);
    expect(JSON.parse(JSON.stringify(titles))).toEqual(titles);
  });

  it('keeps zero days and total consistent with history fixture', () => {
    const item = contractFixtures.cases.find(
      (item) => item.command === 'get_stats',
    );
    if (!item || item.command !== 'get_stats')
      throw new Error('missing Stats fixture');
    expect(item.response.days.map((day) => day.count)).toEqual([0, 0, 1]);
    expect(item.response.total).toBe(
      item.response.days.reduce((sum, day) => sum + day.count, 0),
    );
  });

  it('separates errors by outcome and keeps completed backup metadata on rollback', () => {
    const errors: readonly IpcError[] = contractFixtures.errors;
    expect(
      errors.some(
        (error) =>
          error.outcome === 'unknown' && error.code === 'IPC_UNAVAILABLE',
      ),
    ).toBe(true);
    expect(
      errors.some(
        (error) =>
          error.outcome === 'notApplied' && error.recoveryBackup !== null,
      ),
    ).toBe(true);
    expect(errors.some((error) => error.outcome === 'notApplicable')).toBe(
      true,
    );
  });

  it('keeps invalid consumer shapes unassignable at compile time', () => {
    type Assignable<From, To> = From extends To ? true : false;
    const missingDay: Assignable<
      { taskId: TaskId; target: { kind: 'day' }; expectedRevision: string },
      CommandRequests['move_task']
    > = false;
    const missingRevision: Assignable<
      { view: { kind: 'later' }; page: { offset: number; limit: number } },
      CommandRequests['list_tasks']
    > = false;
    const unconfirmed: Assignable<
      {
        previewToken: PreviewToken;
        confirmed: false;
        expectedRevision: string;
      },
      CommandRequests['restore_data']
    > = false;
    expect([missingDay, missingRevision, unconfirmed]).toEqual([
      false,
      false,
      false,
    ]);
  });
  it('prevents assigning IDs across task, completion and token roles', () => {
    type Assignable<From, To> = From extends To ? true : false;
    const taskToCompletion: Assignable<TaskId, CompletionId> = false;
    const taskToUndoRequest: Assignable<
      TaskId,
      CommandRequests['undo_last']['token']
    > = false;
    const undoToUndoRequest: Assignable<
      UndoToken,
      CommandRequests['undo_last']['token']
    > = true;
    expect([taskToUndoRequest, undoToUndoRequest]).toEqual([false, true]);
    const taskToUndo: Assignable<TaskId, UndoToken> = false;
    const taskToPreview: Assignable<TaskId, PreviewToken> = false;
    const completionToTask: Assignable<CompletionId, TaskId> = false;
    const undoToTask: Assignable<UndoToken, TaskId> = false;
    const previewToTask: Assignable<PreviewToken, TaskId> = false;
    const undoToPreview: Assignable<UndoToken, PreviewToken> = false;
    const previewToUndo: Assignable<PreviewToken, UndoToken> = false;
    expect([
      taskToCompletion,
      taskToUndo,
      taskToPreview,
      completionToTask,
      undoToTask,
      previewToTask,
      undoToPreview,
      previewToUndo,
    ]).toEqual(Array(8).fill(false));
  });

  it('only brands canonical UUID strings at the test fixture boundary', () => {
    const id: TaskId = fixtureId<'task'>(
      '11111111-1111-4111-8111-111111111111',
    );
    expect(id).toBe('11111111-1111-4111-8111-111111111111');
    for (const invalid of [
      'id',
      '',
      'AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA',
      '11111111111141118111111111111111',
    ]) {
      expect(() => fixtureId<'task'>(invalid)).toThrow('canonical UUID');
    }
  });
});
