<script setup lang="ts">
import CrmShell from '~/components/composed/CrmShell.vue';

const crmApi = useCrmApi();
const { data: appointments, pending } = await useAsyncData('dashboard-appointments', () =>
  crmApi.listAppointments({ limit: 20 }),
);

const revenueCents = computed(() => {
  const rows = appointments.value ?? [];
  return rows.length * 4900;
});

const needsConfirmation = computed(() => {
  const rows = appointments.value ?? [];
  return rows.filter((item) => item.status === 'booked').length;
});
</script>

<template>
  <CrmShell>
    <section class="card">
      <span class="badge">Europe/Berlin</span>
      <h1 class="h1">Today dashboard</h1>
      <p class="muted">
        {{ appointments?.length ?? 0 }} appointments, {{ needsConfirmation }} need confirmation.
      </p>
    </section>

    <section class="grid-3">
      <article class="card"><strong>Booked</strong><p class="h1">{{ appointments?.length ?? 0 }}</p></article>
      <article class="card"><strong>No-show risk</strong><p class="h1">{{ needsConfirmation }}</p></article>
      <article class="card"><strong>Revenue</strong><p class="h1">€{{ (revenueCents / 100).toFixed(0) }}</p></article>
    </section>

    <section class="card">
      <div class="btn-row" style="margin-bottom: 10px">
        <button class="btn primary">+ New appointment</button>
        <button class="btn">Send reminder</button>
      </div>
      <table class="table">
        <thead><tr><th>Time</th><th>Client ID</th><th>Service ID</th><th>Status</th></tr></thead>
        <tbody>
          <tr v-if="pending">
            <td colspan="4">Loading appointments...</td>
          </tr>
          <tr v-for="item in appointments" :key="item.id">
            <td>{{ new Date(item.startsAtIso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) }}</td>
            <td>{{ item.clientId }}</td>
            <td>{{ item.serviceId }}</td>
            <td>{{ item.status }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </CrmShell>
</template>
