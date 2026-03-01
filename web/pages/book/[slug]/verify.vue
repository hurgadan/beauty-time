<script setup lang="ts">
import BookingFlowShell from '~/components/composed/BookingFlowShell.vue';
const slug = useBookingSlug();
const route = useRoute();
</script>

<template>
  <BookingFlowShell :step="6" title="Verify with OTP">
    <section class="card">
      <p class="muted">Magic link sent to email. Enter 6-digit code.</p>
      <div class="slot-grid" style="grid-template-columns: repeat(6, minmax(0, 1fr))">
        <div class="slot active">1</div>
        <div class="slot active">7</div>
        <div class="slot active">4</div>
        <div class="slot active">9</div>
        <div class="slot"></div>
        <div class="slot"></div>
      </div>
      <div v-if="route.query.state === 'otp-expired'" class="alert error">
        OTP expired. Request a new code to continue.
      </div>
      <div v-else class="alert warn">OTP expires in 10 minutes. Resend available.</div>
      <div class="btn-row" style="margin-top: 10px">
        <NuxtLink class="btn" :to="`/book/${slug}/contact`">Back</NuxtLink>
        <NuxtLink class="btn primary" :to="`/book/${slug}/success`">Verify and confirm</NuxtLink>
      </div>
    </section>

    <section class="card">
      <h3>No slots / OTP expired</h3>
      <div class="btn-row">
        <NuxtLink class="btn" :to="`/book/${slug}/datetime?state=no-slots`">No slots state</NuxtLink>
        <NuxtLink class="btn" :to="`/book/${slug}/verify?state=otp-expired`">OTP expired state</NuxtLink>
      </div>
    </section>
  </BookingFlowShell>
</template>
