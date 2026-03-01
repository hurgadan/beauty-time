<script setup lang="ts">
import CrmShell from '~/components/composed/CrmShell.vue';
</script>

<template>
  <CrmShell>
    <section class="card">
      <span class="badge">Email only in v1</span>
      <h1 class="h1">Reminder settings</h1>
      <p class="muted">T-24h and T-2h confirmation messages.</p>
    </section>

    <section class="card grid-2">
      <article class="card">
        <strong>Triggers</strong>
        <p>T-24h reminder</p>
        <p>T-2h reminder</p>
      </article>
      <article class="card">
        <strong>Delivery</strong>
        <p>09:00 batch: 37/38 delivered</p>
        <p>11:00 batch: 22/22 delivered</p>
      </article>
    </section>
  </CrmShell>
</template>
