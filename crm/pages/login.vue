<script setup lang="ts">
const crmApi = useCrmApi();

const form = reactive({
  email: '',
  password: '',
});
const errorMessage = ref('');
const pending = ref(false);

async function submit(): Promise<void> {
  errorMessage.value = '';
  pending.value = true;

  try {
    await crmApi.staffLogin({
      email: form.email,
      password: form.password,
    });
    await navigateTo('/dashboard');
  } catch {
    errorMessage.value = 'Login failed. Demo mode is still available.';
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <div class="crm-shell" style="grid-template-columns: 1fr">
    <section class="card grid-2">
      <article class="card">
        <span class="badge">Owner / Staff</span>
        <h1 class="h1">Login</h1>
        <p class="muted">Sign in to manage calendar and clients.</p>

        <form class="grid-2" style="grid-template-columns: 1fr; margin-top: 12px" @submit.prevent="submit">
          <input v-model="form.email" class="btn" type="email" placeholder="you@studio.de" required>
          <input v-model="form.password" class="btn" type="password" placeholder="Password" required>
          <div class="btn-row">
            <button class="btn primary" :disabled="pending" type="submit">
              {{ pending ? 'Signing in...' : 'Sign in' }}
            </button>
            <NuxtLink to="/dashboard" class="btn">Open demo</NuxtLink>
          </div>
          <p v-if="errorMessage" class="muted">{{ errorMessage }}</p>
        </form>
      </article>
      <article class="card">
        <span class="badge">Onboarding</span>
        <h2 class="h1">Create workspace</h2>
        <p class="muted">Set business type, timezone (Europe/Berlin), and locale.</p>
      </article>
    </section>
  </div>
</template>
