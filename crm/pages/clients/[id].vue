<script setup lang="ts">
import CrmShell from '~/components/composed/CrmShell.vue';

const route = useRoute();
const crmApi = useCrmApi();
const clientId = computed(() => String(route.params.id));

const { data: client, pending: pendingClient } = await useAsyncData(
  () => `client-${clientId.value}`,
  () => crmApi.getClient(clientId.value),
);

const { data: history, pending: pendingHistory } = await useAsyncData(
  () => `client-history-${clientId.value}`,
  () => crmApi.getClientHistory(clientId.value, 20),
);

const exporting = ref(false);
const anonymizing = ref(false);
const actionMessage = ref("");
const actionError = ref("");

async function exportClientData(): Promise<void> {
  exporting.value = true;
  actionMessage.value = "";
  actionError.value = "";

  try {
    const exported = await crmApi.exportClientData(clientId.value, 100);
    actionMessage.value = `Exported ${exported.history.length} history records.`;
  } catch {
    actionError.value = "Failed to export client data.";
  } finally {
    exporting.value = false;
  }
}

async function anonymizeClientData(): Promise<void> {
  const proceed = window.confirm(
    "Anonymize personal data for this client? This action cannot be undone.",
  );
  if (!proceed) {
    return;
  }

  anonymizing.value = true;
  actionMessage.value = "";
  actionError.value = "";

  try {
    await crmApi.anonymizeClientData(clientId.value);
    actionMessage.value = "Client personal data has been anonymized.";
    await refreshNuxtData(`client-${clientId.value}`);
    await refreshNuxtData(`client-history-${clientId.value}`);
  } catch {
    actionError.value = "Failed to anonymize client data.";
  } finally {
    anonymizing.value = false;
  }
}
</script>

<template>
  <CrmShell>
    <section class="card">
      <span :class="client?.isReturningClient ? 'badge ok' : 'badge'">
        {{ client?.isReturningClient ? 'Returning client' : 'New client' }}
      </span>
      <h1 class="h1">Client: {{ client?.firstName }} {{ client?.lastName }}</h1>
      <p class="muted">Verified with magic link + OTP.</p>
      <div class="btn-row" style="margin-top: 10px">
        <button class="btn" :disabled="exporting" @click="exportClientData">
          {{ exporting ? "Exporting..." : "Export GDPR data" }}
        </button>
        <button class="btn" :disabled="anonymizing" @click="anonymizeClientData">
          {{ anonymizing ? "Anonymizing..." : "Anonymize personal data" }}
        </button>
      </div>
      <p v-if="actionMessage" class="badge ok" style="margin-top: 10px">{{ actionMessage }}</p>
      <p v-if="actionError" class="badge warn" style="margin-top: 10px">{{ actionError }}</p>
    </section>

    <section class="card grid-2">
      <article class="card">
        <strong>Profile</strong>
        <p v-if="pendingClient" class="muted">Loading profile...</p>
        <template v-else>
          <p>Name: {{ client?.firstName }} {{ client?.lastName }}</p>
          <p>Email: {{ client?.email }}</p>
          <p>Phone: {{ client?.phone ?? 'not provided' }}</p>
          <p>Gender: {{ client?.gender }}</p>
        </template>
      </article>
      <article class="card">
        <strong>History</strong>
        <p v-if="pendingHistory" class="muted">Loading history...</p>
        <template v-else>
          <p v-for="item in history" :key="item.appointmentId">
            {{ new Date(item.startsAtIso).toLocaleDateString('de-DE') }} · {{ item.serviceId }} · {{ item.status }}
          </p>
        </template>
      </article>
    </section>
  </CrmShell>
</template>
