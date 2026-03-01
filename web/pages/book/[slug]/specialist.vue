<script setup lang="ts">
import BookingFlowShell from '~/components/composed/BookingFlowShell.vue';
const slug = useBookingSlug();
</script>

<template>
  <BookingFlowShell :step="3" title="Choose specialist">
    <section class="card">
      <div class="btn-row">
        <button class="btn primary">Any available</button>
        <button class="btn">Anna (Nails)</button>
        <button class="btn">Mila (Hair)</button>
      </div>
      <div class="alert ok">Any available selected for earliest slot.</div>
      <div class="btn-row" style="margin-top: 10px">
        <NuxtLink class="btn" :to="`/book/${slug}/service`">Back</NuxtLink>
        <NuxtLink class="btn primary" :to="`/book/${slug}/datetime`">Continue</NuxtLink>
      </div>
    </section>
  </BookingFlowShell>
</template>
