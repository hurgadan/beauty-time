<script setup lang="ts">
import CrmShell from '~/components/composed/CrmShell.vue';
</script>

<template>
  <CrmShell>
    <section class="card">
      <span class="badge">Staff</span>
      <h1 class="h1">Team and schedule</h1>
      <p class="muted">Includes roles, working hours, and time-off.</p>
    </section>

    <section class="card grid-2">
      <article class="card">
        <strong>Team</strong>
        <p>Mila · Hair</p>
        <p>Anna · Nails</p>
      </article>
      <article class="card">
        <strong>Working hours</strong>
        <p>Mon-Fri 09:00-18:00</p>
        <p>Sat 10:00-15:00</p>
      </article>
    </section>
  </CrmShell>
</template>
