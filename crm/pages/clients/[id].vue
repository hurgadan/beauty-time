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
</script>

<template>
  <CrmShell>
    <section class="card">
      <span :class="client?.isReturningClient ? 'badge ok' : 'badge'">
        {{ client?.isReturningClient ? 'Returning client' : 'New client' }}
      </span>
      <h1 class="h1">Client: {{ client?.firstName }} {{ client?.lastName }}</h1>
      <p class="muted">Verified with magic link + OTP.</p>
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
