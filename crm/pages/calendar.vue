<script setup lang="ts">
import CrmShell from '~/components/composed/CrmShell.vue';
</script>

<template>
  <CrmShell>
    <section class="card">
      <span class="badge">Calendar</span>
      <h1 class="h1">Day / Week schedule</h1>
      <p class="muted">30-minute slots, service-level buffer handling.</p>
    </section>

    <section class="card grid-2">
      <article class="card">
        <strong>09:00</strong>
        <p>Lea M. · Cut + Styling</p>
      </article>
      <article class="card">
        <strong>11:00</strong>
        <p>Sofia L. · Pedicure Classic</p>
        <span class="badge warn">Needs confirm</span>
      </article>
    </section>
  </CrmShell>
</template>
