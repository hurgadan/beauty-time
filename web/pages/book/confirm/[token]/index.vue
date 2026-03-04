<script setup lang="ts">
import BookingFlowShell from '~/components/composed/BookingFlowShell.vue';

const route = useRoute();
const bookingApi = useBookingApi();
const token = computed(() => String(route.params.token));

const confirming = ref(false);
const statusMessage = ref('');
const errorMessage = ref('');

async function confirmFromReminder(): Promise<void> {
  confirming.value = true;
  errorMessage.value = '';

  try {
    const response = await bookingApi.confirmAppointment(token.value);
    statusMessage.value = `Status updated: ${response.status}`;
  } catch {
    errorMessage.value = 'Failed to confirm appointment from reminder.';
  } finally {
    confirming.value = false;
  }
}
</script>

<template>
  <BookingFlowShell :step="8" title="Reminder confirmation" subtitle="Opened from reminder email.">
    <section class="card">
      <span class="badge">Token: {{ token }}</span>
      <p style="margin-top: 8px">Confirm if you will come to your visit.</p>
      <div class="btn-row" style="margin-top: 10px">
        <button class="btn primary" :disabled="confirming" @click="confirmFromReminder">
          {{ confirming ? 'Confirming...' : 'Yes, I will come' }}
        </button>
        <button class="btn">Reschedule</button>
        <button class="btn">Cancel appointment</button>
      </div>
      <div v-if="statusMessage" class="alert ok">{{ statusMessage }}</div>
      <div v-if="errorMessage" class="alert error">{{ errorMessage }}</div>
    </section>
  </BookingFlowShell>
</template>
