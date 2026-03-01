<script setup lang="ts">
import BookingFlowShell from '~/components/composed/BookingFlowShell.vue';
const slug = useBookingSlug();
</script>

<template>
  <BookingFlowShell :step="1" title="Book your appointment" subtitle="Fast self-booking without password.">
    <section class="card">
      <span class="badge">Salon</span>
      <p><strong>{{ slug }}</strong></p>
      <p class="muted">Choose service, time, then verify with magic link + OTP.</p>
      <div class="btn-row" style="margin-top: 10px">
        <NuxtLink class="btn primary" :to="`/book/${slug}/service`">Start booking</NuxtLink>
      </div>
    </section>
  </BookingFlowShell>
</template>
