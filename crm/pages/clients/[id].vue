<script setup lang="ts">
import CrmShell from '~/components/composed/CrmShell.vue';
const route = useRoute();
</script>

<template>
  <CrmShell>
    <section class="card">
      <span class="badge ok">Returning client</span>
      <h1 class="h1">Client: {{ route.params.id }}</h1>
      <p class="muted">Verified with magic link + OTP.</p>
    </section>

    <section class="card grid-2">
      <article class="card">
        <strong>Profile</strong>
        <p>Name: Sofia Ludwig</p>
        <p>Email: sofia@example.de</p>
      </article>
      <article class="card">
        <strong>History</strong>
        <p>20 Feb · Pedicure · completed</p>
        <p>18 Jan · Manicure · completed</p>
      </article>
    </section>
  </CrmShell>
</template>
