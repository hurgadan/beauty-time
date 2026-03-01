<template>
  <div class="crm-shell" style="grid-template-columns: 1fr">
    <section class="card grid-2">
      <article class="card">
        <span class="badge">Owner / Staff</span>
        <h1 class="h1">Login</h1>
        <p class="muted">Sign in to manage calendar and clients.</p>
        <div class="btn-row" style="margin-top: 12px">
          <button class="btn primary">Sign in</button>
          <NuxtLink to="/dashboard" class="btn">Open demo</NuxtLink>
        </div>
      </article>
      <article class="card">
        <span class="badge">Onboarding</span>
        <h2 class="h1">Create workspace</h2>
        <p class="muted">Set business type, timezone (Europe/Berlin), and locale.</p>
      </article>
    </section>
  </div>
</template>
