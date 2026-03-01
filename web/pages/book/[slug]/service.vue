<script setup lang="ts">
import BookingFlowShell from '~/components/composed/BookingFlowShell.vue';
const slug = useBookingSlug();
</script>

<template>
  <BookingFlowShell :step="2" title="Choose service">
    <section class="card">
      <div class="btn-row">
        <button class="btn">Haircut + Styling · 45m · €49</button>
        <button class="btn primary">Manicure Premium · 60m · €55</button>
        <button class="btn">Pedicure Classic · 45m · €42</button>
      </div>
      <div class="btn-row" style="margin-top: 10px">
        <NuxtLink class="btn" :to="`/book/${slug}`">Back</NuxtLink>
        <NuxtLink class="btn primary" :to="`/book/${slug}/specialist`">Continue</NuxtLink>
      </div>
    </section>
  </BookingFlowShell>
</template>
