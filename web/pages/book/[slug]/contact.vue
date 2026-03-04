<script setup lang="ts">
import BookingFlowShell from '~/components/composed/BookingFlowShell.vue';

const slug = useBookingSlug();
const bookingApi = useBookingApi();
const { flow } = useBookingFlowState();

if (!flow.value.slotIso) {
  await navigateTo(`/book/${slug}/datetime`);
}

const sending = ref(false);
const errorMessage = ref('');

async function sendCode(): Promise<void> {
  if (!flow.value.clientName || !flow.value.clientEmail) {
    errorMessage.value = 'Please fill in name and email.';
    return;
  }

  sending.value = true;
  errorMessage.value = '';

  try {
    await bookingApi.sendMagicLink({
      tenantSlug: slug,
      email: flow.value.clientEmail,
    });
    await navigateTo(`/book/${slug}/verify`);
  } catch {
    errorMessage.value = 'Failed to send OTP. Please retry.';
  } finally {
    sending.value = false;
  }
}
</script>

<template>
  <BookingFlowShell :step="5" title="Contact and consent">
    <section class="card">
      <div class="field">
        <label>Name</label>
        <input v-model="flow.clientName" class="input" placeholder="Anna Müller">
      </div>
      <div class="field">
        <label>Email</label>
        <input v-model="flow.clientEmail" class="input" type="email" placeholder="anna@email.de">
      </div>
      <div class="field">
        <label>Reminder channel</label>
        <select class="select">
          <option>Email (v1)</option>
        </select>
      </div>
      <p class="muted">DE-first consent copy with EN fallback.</p>
      <p v-if="errorMessage" class="alert error">{{ errorMessage }}</p>
      <div class="btn-row" style="margin-top: 10px">
        <NuxtLink class="btn" :to="`/book/${slug}/datetime`">Back</NuxtLink>
        <button class="btn primary" :disabled="sending" @click="sendCode">
          {{ sending ? 'Sending...' : 'Send magic link + OTP' }}
        </button>
      </div>
    </section>
  </BookingFlowShell>
</template>
