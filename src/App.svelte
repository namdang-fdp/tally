<script lang="ts">
  type View = 'tasks' | 'stats';
  let activeView = $state<View>('tasks');
</script>

<div class="shell">
  <header>
    <span class="wordmark"
      >Tally<span class="brand-dot" aria-hidden="true">.</span></span
    >
    <span class="preview-label">Bản xem trước</span>
  </header>

  <nav aria-label="Điều hướng chính">
    <button
      type="button"
      aria-current={activeView === 'tasks' ? 'page' : undefined}
      onclick={() => (activeView = 'tasks')}>Tasks</button
    >
    <button
      type="button"
      aria-current={activeView === 'stats' ? 'page' : undefined}
      onclick={() => (activeView = 'stats')}>Stats</button
    >
  </nav>

  <main aria-labelledby="view-title">
    {#if activeView === 'tasks'}
      <h1 id="view-title">Tasks</h1>
      <p class="intro">Một nơi nhỏ cho những việc mỗi ngày.</p>
      <p class="placeholder">Tính năng ghi việc sẽ có ở bản tiếp theo.</p>
    {:else}
      <h1 id="view-title">Stats</h1>
      <p class="intro">Nhìn lại những gì bạn đã làm được.</p>
      <p class="placeholder">Lịch sử và thống kê sẽ có ở bản tiếp theo.</p>
    {/if}
  </main>
</div>
