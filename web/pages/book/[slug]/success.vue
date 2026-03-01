<script setup lang="ts">
import BookingFlowShell from '~/components/composed/BookingFlowShell.vue';
const slug = useBookingSlug();
</script>

<template>
  <BookingFlowShell :step="7" title="Appointment confirmed">
    <section class="card">
      <span class="badge ok">Success</span>
      <p>Fri, 27 Feb 2026 at 10:00 · Manicure Premium</p>
      <div class="alert ok">You will receive reminders at T-24h and T-2h.</div>
      <div class="btn-row" style="margin-top: 10px">
        <button class="btn">Add to calendar</button>
        <NuxtLink class="btn primary" :to="`/book/confirm/reminder-token-demo`">Open reminder confirmation</NuxtLink>
      </div>
      <div class="btn-row" style="margin-top: 10px">
        <NuxtLink class="btn" :to="`/book/${slug}`">Book another visit</NuxtLink>
      </div>
    </section>
  </BookingFlowShell>
</template>
