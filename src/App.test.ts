import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App.svelte';

describe('shell navigation', () => {
  it('opens Tasks with an accessible current navigation item', () => {
    render(App);

    expect(
      screen.getByRole('heading', { name: 'Tasks', level: 1 }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Tasks', current: 'page' }),
    ).toBeVisible();
    expect(
      screen.getByText('Tính năng ghi việc sẽ có ở bản tiếp theo.'),
    ).toBeVisible();
  });

  it('switches content and current navigation item in both directions', async () => {
    const user = userEvent.setup();
    render(App);

    await user.click(screen.getByRole('button', { name: 'Stats' }));
    expect(
      screen.getByRole('heading', { name: 'Stats', level: 1 }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Stats', current: 'page' }),
    ).toBeVisible();
    expect(
      screen.queryByRole('heading', { name: 'Tasks' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('Lịch sử và thống kê sẽ có ở bản tiếp theo.'),
    ).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Tasks' }));
    expect(
      screen.getByRole('heading', { name: 'Tasks', level: 1 }),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Stats' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('navigates with Tab, Enter, Shift+Tab and Space while preserving focus', async () => {
    const user = userEvent.setup();
    render(App);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Tasks' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Stats' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('heading', { name: 'Stats' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Stats' })).toHaveFocus();

    await user.tab({ shift: true });
    await user.keyboard(' ');
    expect(screen.getByRole('heading', { name: 'Tasks' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Tasks' })).toHaveFocus();
  });
});
