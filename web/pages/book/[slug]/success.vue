<script setup lang="ts">
import BookingFlowShell from '~/components/composed/BookingFlowShell.vue';

const slug = useBookingSlug();
const { flow, resetFlow } = useBookingFlowState();

if (!flow.value.appointmentId) {
  await navigateTo(`/book/${slug}`);
}

function bookAnother(): void {
  resetFlow();
  void navigateTo(`/book/${slug}?restart=1`);
}
</script>

<template>
  <BookingFlowShell :step="7" title="Appointment confirmed">
    <section class="card">
      <span class="badge ok">Success</span>
      <p>
        {{ flow.service?.name }} ·
        {{ new Date(flow.slotIso).toLocaleString('de-DE', { dateStyle: 'full', timeStyle: 'short' }) }}
      </p>
      <div class="alert ok">You will receive reminders at T-24h and T-2h.</div>
      <div class="btn-row" style="margin-top: 10px">
        <button class="btn">Add to calendar</button>
        <NuxtLink class="btn primary" :to="`/book/confirm/${flow.appointmentId}`">
          Open reminder confirmation
        </NuxtLink>
      </div>
      <div class="btn-row" style="margin-top: 10px">
        <button class="btn" @click="bookAnother">Book another visit</button>
      </div>
    </section>
  </BookingFlowShell>
</template>
