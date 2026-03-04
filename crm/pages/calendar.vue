<script setup lang="ts">
import CrmShell from '~/components/composed/CrmShell.vue';

const crmApi = useCrmApi();
const { data: appointments, pending } = await useAsyncData('calendar-appointments', () =>
  crmApi.listAppointments({ limit: 30 }),
);

const sortedAppointments = computed(() =>
  [...(appointments.value ?? [])].sort((a, b) => a.startsAtIso.localeCompare(b.startsAtIso)),
);
</script>

<template>
  <CrmShell>
    <section class="card">
      <span class="badge">Calendar</span>
      <h1 class="h1">Day / Week schedule</h1>
      <p class="muted">30-minute slots, service-level buffer handling.</p>
    </section>

    <section class="card">
      <p v-if="pending" class="muted">Loading schedule...</p>
      <table v-else class="table">
        <thead><tr><th>Start</th><th>End</th><th>Staff</th><th>Status</th></tr></thead>
        <tbody>
          <tr v-for="item in sortedAppointments" :key="item.id">
            <td>{{ new Date(item.startsAtIso).toLocaleString('de-DE') }}</td>
            <td>{{ new Date(item.endsAtIso).toLocaleString('de-DE') }}</td>
            <td>{{ item.staffId }}</td>
            <td>{{ item.status }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </CrmShell>
</template>
