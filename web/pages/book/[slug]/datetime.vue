<script setup lang="ts">
import BookingFlowShell from '~/components/composed/BookingFlowShell.vue';
const slug = useBookingSlug();
const route = useRoute();
</script>

<template>
  <BookingFlowShell :step="4" title="Choose date and time">
    <section class="card">
      <div class="field">
        <label>Date</label>
        <input class="input" value="Fri, 27 Feb 2026" />
      </div>
      <div class="slot-grid">
        <button class="slot">09:00</button>
        <button class="slot">09:30</button>
        <button class="slot active">10:00</button>
        <button class="slot">10:30</button>
        <button class="slot">11:00</button>
        <button class="slot">11:30</button>
        <button class="slot disabled">12:00</button>
        <button class="slot">12:30</button>
      </div>
      <div v-if="route.query.state === 'no-slots'" class="alert error">
        No slots available for selected day. Choose another date.
      </div>
      <div v-else class="alert error">If slot becomes unavailable, user must pick another time.</div>
      <div class="btn-row" style="margin-top: 10px">
        <NuxtLink class="btn" :to="`/book/${slug}/specialist`">Back</NuxtLink>
        <NuxtLink class="btn primary" :to="`/book/${slug}/contact`">Continue</NuxtLink>
      </div>
    </section>
  </BookingFlowShell>
</template>
