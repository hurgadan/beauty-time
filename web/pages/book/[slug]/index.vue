<script setup lang="ts">
import BookingFlowShell from '~/components/composed/BookingFlowShell.vue';

const slug = useBookingSlug();
const bookingApi = useBookingApi();
const { resetFlow } = useBookingFlowState();
const route = useRoute();

if (route.query.restart === '1') {
  resetFlow();
}

const { data: config, pending } = await useAsyncData(`booking-config-${slug}`, () =>
  bookingApi.getBookingConfig(slug),
);
</script>

<template>
  <BookingFlowShell :step="1" title="Book your appointment" subtitle="Fast self-booking without password.">
    <section class="card">
      <span class="badge">Salon</span>
      <p><strong>{{ slug }}</strong></p>
      <p class="muted">
        Timezone: {{ config?.timezone ?? 'Europe/Berlin' }} · Reminders:
        {{ (config?.reminderChannels ?? ['email']).join(', ') }}
      </p>
      <p v-if="pending" class="muted">Loading booking config...</p>
      <div class="btn-row" style="margin-top: 10px">
        <NuxtLink class="btn primary" :to="`/book/${slug}/service`">Start booking</NuxtLink>
      </div>
    </section>
  </BookingFlowShell>
</template>
