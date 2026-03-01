<script setup lang="ts">
import CrmShell from '~/components/composed/CrmShell.vue';
</script>

<template>
  <CrmShell>
    <section class="card">
      <span class="badge">Settings</span>
      <h1 class="h1">Workspace, locale, compliance</h1>
      <p class="muted">DE-first locale and GDPR handling.</p>
    </section>

    <section class="card grid-2">
      <article class="card">
        <strong>Workspace</strong>
        <p>Timezone: Europe/Berlin</p>
        <p>Locale: de-DE</p>
      </article>
      <article class="card">
        <strong>Legal</strong>
        <p>Data export requests</p>
        <p>Delete requests</p>
      </article>
    </section>
  </CrmShell>
</template>
