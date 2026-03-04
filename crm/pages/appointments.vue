<script setup lang="ts">
import CrmShell from '~/components/composed/CrmShell.vue';
import { AppointmentStatus } from '@beauty-time/crm-contracts';

const crmApi = useCrmApi();
const { data: appointments, pending, refresh } = await useAsyncData('appointments-list', () =>
  crmApi.listAppointments({ limit: 50 }),
);
const { data: staff } = await useAsyncData('appointments-staff-list', () => crmApi.listStaff({ limit: 100 }));
const { data: services } = await useAsyncData('appointments-services-list', () => crmApi.listServices());
const { data: clients } = await useAsyncData('appointments-clients-list', () => crmApi.listClients({ limit: 100 }));

const createForm = reactive({
  staffId: '',
  serviceId: '',
  clientId: '',
  startsAtLocal: '',
  notes: '',
});

const statuses = Object.values(AppointmentStatus);
const rowStatus = reactive<Record<string, AppointmentStatus>>({});
const errorMessage = ref('');

watch(
  appointments,
  (items) => {
    for (const item of items ?? []) {
      rowStatus[item.id] = item.status;
    }
  },
  { immediate: true },
);

const selectedService = computed(() => services.value?.find((item) => item.id === createForm.serviceId) ?? null);

function toIso(localDateTime: string): string {
  return new Date(localDateTime).toISOString();
}

async function createAppointment(): Promise<void> {
  errorMessage.value = '';
  try {
    const startsAtIso = toIso(createForm.startsAtLocal);
    const durationMinutes = selectedService.value?.durationMinutes ?? 30;
    const endsAtIso = new Date(new Date(startsAtIso).getTime() + durationMinutes * 60_000).toISOString();

    await crmApi.createAppointment({
      staffId: createForm.staffId,
      serviceId: createForm.serviceId,
      clientId: createForm.clientId,
      startsAtIso,
      endsAtIso,
      notes: createForm.notes || undefined,
    });

    createForm.staffId = '';
    createForm.serviceId = '';
    createForm.clientId = '';
    createForm.startsAtLocal = '';
    createForm.notes = '';
    await refresh();
  } catch {
    errorMessage.value = 'Appointment create failed.';
  }
}

async function updateStatus(appointmentId: string): Promise<void> {
  errorMessage.value = '';
  try {
    await crmApi.updateAppointment(appointmentId, { status: rowStatus[appointmentId] });
    await refresh();
  } catch {
    errorMessage.value = 'Appointment update failed.';
  }
}

async function cancelByStaff(appointmentId: string): Promise<void> {
  rowStatus[appointmentId] = AppointmentStatus.CANCELLED_BY_STAFF;
  await updateStatus(appointmentId);
}
</script>

<template>
  <CrmShell>
    <section class="card">
      <span class="badge">Appointments</span>
      <h1 class="h1">Create, edit, cancel</h1>
      <p class="muted">Cancellation reason should be saved to audit log.</p>
      <p v-if="errorMessage" class="muted">{{ errorMessage }}</p>
    </section>

    <section class="card">
      <h3 style="margin-top: 0">Create appointment</h3>
      <div class="grid-2">
        <select v-model="createForm.staffId" class="btn">
          <option disabled value="">Select staff</option>
          <option v-for="item in staff" :key="item.id" :value="item.id">{{ item.fullName }}</option>
        </select>
        <select v-model="createForm.serviceId" class="btn">
          <option disabled value="">Select service</option>
          <option v-for="item in services" :key="item.id" :value="item.id">{{ item.name }} ({{ item.durationMinutes }}m)</option>
        </select>
        <select v-model="createForm.clientId" class="btn">
          <option disabled value="">Select client</option>
          <option v-for="item in clients" :key="item.id" :value="item.id">{{ item.firstName }} {{ item.lastName }}</option>
        </select>
        <input v-model="createForm.startsAtLocal" class="btn" type="datetime-local">
      </div>
      <div style="margin-top: 8px">
        <input v-model="createForm.notes" class="btn" type="text" placeholder="Notes">
      </div>
      <div class="btn-row" style="margin-top: 10px">
        <button class="btn primary" @click="createAppointment">Create appointment</button>
      </div>
    </section>

    <section class="card">
      <table class="table">
        <thead><tr><th>Start</th><th>Client</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          <tr v-if="pending">
            <td colspan="4">Loading appointments...</td>
          </tr>
          <tr v-for="item in appointments" :key="item.id">
            <td>{{ new Date(item.startsAtIso).toLocaleString('de-DE') }}</td>
            <td>{{ item.clientId }}</td>
            <td>
              <select v-model="rowStatus[item.id]" class="btn">
                <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
              </select>
            </td>
            <td>
              <div class="btn-row">
                <button class="btn primary" @click="updateStatus(item.id)">Save status</button>
                <button class="btn" @click="cancelByStaff(item.id)">Cancel</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </CrmShell>
</template>
