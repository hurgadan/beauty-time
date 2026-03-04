<script setup lang="ts">
import BookingFlowShell from '~/components/composed/BookingFlowShell.vue';

const bookingApi = useBookingApi();
const { flow } = useBookingFlowState();

const tokenInput = ref(flow.value.clientToken);
const exportLimitInput = ref(100);
const exporting = ref(false);
const anonymizing = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const exportData = ref<Awaited<ReturnType<typeof bookingApi.exportPersonalData>> | null>(null);

watch(tokenInput, (value) => {
  flow.value.clientToken = value.trim();
});

function getToken(): string {
  return tokenInput.value.trim();
}

async function runExport(): Promise<void> {
  const token = getToken();
  if (!token) {
    errorMessage.value = 'Client token is required. Complete OTP verification in booking flow first.';
    return;
  }

  exporting.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    exportData.value = await bookingApi.exportPersonalData(token, exportLimitInput.value);
    successMessage.value = 'Personal data export completed.';
  } catch {
    errorMessage.value = 'Failed to export personal data. Check token and try again.';
  } finally {
    exporting.value = false;
  }
}

async function runAnonymize(): Promise<void> {
  const token = getToken();
  if (!token) {
    errorMessage.value = 'Client token is required. Complete OTP verification in booking flow first.';
    return;
  }

  const proceed = window.confirm(
    'This will anonymize your personal data. Booking history stays for business records. Continue?',
  );

  if (!proceed) {
    return;
  }

  anonymizing.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    await bookingApi.anonymizePersonalData(token);
    successMessage.value = 'Personal data anonymized successfully.';
  } catch {
    errorMessage.value = 'Failed to anonymize data. Check token and try again.';
  } finally {
    anonymizing.value = false;
  }
}
</script>

<template>
  <BookingFlowShell
    :step="1"
    title="Privacy / GDPR request"
    subtitle="Client self-service for personal data export and anonymization."
  >
    <section class="card">
      <p class="muted">
        Use your client token from the OTP verification step. This page works without CRM access.
      </p>

      <div class="field">
        <label>Client access token</label>
        <textarea
          v-model="tokenInput"
          class="input"
          rows="4"
          placeholder="Paste client JWT token"
        />
      </div>

      <div class="field">
        <label>Export history limit</label>
        <input v-model.number="exportLimitInput" class="input" type="number" min="1" max="1000">
      </div>

      <div class="btn-row" style="margin-top: 10px">
        <button class="btn primary" :disabled="exporting" @click="runExport">
          {{ exporting ? 'Exporting...' : 'Export my personal data' }}
        </button>
        <button class="btn" :disabled="anonymizing" @click="runAnonymize">
          {{ anonymizing ? 'Anonymizing...' : 'Anonymize my personal data' }}
        </button>
      </div>

      <p v-if="errorMessage" class="alert error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="alert ok">{{ successMessage }}</p>

      <div v-if="exportData" class="alert ok">
        <p><strong>Client:</strong> {{ exportData.client.firstName }} {{ exportData.client.lastName }}</p>
        <p><strong>Email:</strong> {{ exportData.client.email }}</p>
        <p><strong>Appointments in export:</strong> {{ exportData.history.length }}</p>
        <p><strong>Exported at:</strong> {{ new Date(exportData.exportedAtIso).toLocaleString('de-DE') }}</p>
      </div>
    </section>
  </BookingFlowShell>
</template>
