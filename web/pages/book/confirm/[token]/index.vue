<script setup lang="ts">
import BookingFlowShell from '~/components/composed/BookingFlowShell.vue';
const route = useRoute();
</script>

<template>
  <BookingFlowShell :step="8" title="Reminder confirmation" subtitle="Opened from reminder email.">
    <section class="card">
      <span class="badge">Token: {{ route.params.token }}</span>
      <p style="margin-top: 8px">Fri, 27 Feb 2026 · 10:00 · Manicure Premium</p>
      <div class="btn-row" style="margin-top: 10px">
        <button class="btn primary">Yes, I will come</button>
        <button class="btn">Reschedule</button>
        <button class="btn">Cancel appointment</button>
      </div>
      <div class="alert ok">Status updated to confirmed_by_reminder.</div>
    </section>
  </BookingFlowShell>
</template>
