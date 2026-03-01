<script setup lang="ts">
import CrmShell from '~/components/composed/CrmShell.vue';
</script>

<template>
  <CrmShell>
    <section class="card">
      <span class="badge">Appointments</span>
      <h1 class="h1">Create, edit, cancel</h1>
      <p class="muted">Cancellation reason should be saved to audit log.</p>
    </section>

    <section class="card grid-2">
      <article class="card">
        <strong>Form</strong>
        <p class="muted">Client, service, staff, time, status.</p>
        <div class="btn-row" style="margin-top: 10px">
          <button class="btn primary">Save</button>
          <button class="btn">Cancel appointment</button>
        </div>
      </article>
      <article class="card">
        <strong>Conflict detector</strong>
        <p class="muted">Overlap with 10m post-buffer at 10:30.</p>
        <span class="badge warn">Conflict</span>
      </article>
    </section>
  </CrmShell>
</template>
