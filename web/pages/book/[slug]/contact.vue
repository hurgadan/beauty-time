<script setup lang="ts">
import BookingFlowShell from '~/components/composed/BookingFlowShell.vue';
const slug = useBookingSlug();
</script>

<template>
  <BookingFlowShell :step="5" title="Contact and consent">
    <section class="card">
      <div class="field">
        <label>Name</label>
        <input class="input" placeholder="Anna Müller" />
      </div>
      <div class="field">
        <label>Email</label>
        <input class="input" placeholder="anna@email.de" />
      </div>
      <div class="field">
        <label>Reminder channel</label>
        <select class="select">
          <option>Email (v1)</option>
        </select>
      </div>
      <p class="muted">DE-first consent copy with EN fallback.</p>
      <div class="btn-row" style="margin-top: 10px">
        <NuxtLink class="btn" :to="`/book/${slug}/datetime`">Back</NuxtLink>
        <NuxtLink class="btn primary" :to="`/book/${slug}/verify`">Send magic link + OTP</NuxtLink>
      </div>
    </section>
  </BookingFlowShell>
</template>
