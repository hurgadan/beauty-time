<script setup lang="ts">
import CrmShell from '~/components/composed/CrmShell.vue';
import type { StaffItemDto, UpdateStaffDto } from '@hurgadan/beauty-time-crm-contracts';

const crmApi = useCrmApi();
const { data: staff, pending, refresh } = await useAsyncData('staff-list', () => crmApi.listStaff({ limit: 50 }));

const createForm = reactive({
  email: '',
  fullName: '',
  role: 'staff' as 'owner' | 'staff',
  isActive: true,
});
const editingId = ref<string | null>(null);
const editingForm = reactive<UpdateStaffDto>({});
const selectedStaffId = ref<string | null>(null);
const errorMessage = ref('');

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const workingHoursRows = reactive(
  dayLabels.map((label, index) => ({
    label,
    dayOfWeek: index + 1,
    enabled: index < 5,
    startTime: '09:00',
    endTime: '18:00',
  })),
);

const { data: workingHours, refresh: refreshWorkingHours } = await useAsyncData(
  'staff-working-hours',
  async () => {
    if (!selectedStaffId.value) {
      return [];
    }
    return crmApi.listWorkingHours(selectedStaffId.value);
  },
  { default: () => [] },
);

const { data: timeOffItems, refresh: refreshTimeOff } = await useAsyncData(
  'staff-time-off',
  async () => {
    if (!selectedStaffId.value) {
      return [];
    }
    return crmApi.listTimeOff(selectedStaffId.value);
  },
  { default: () => [] },
);

const timeOffForm = reactive({
  startsAtLocal: '',
  endsAtLocal: '',
  reason: '',
});

watch(selectedStaffId, async () => {
  await refreshWorkingHours();
  await refreshTimeOff();
});

watch(
  workingHours,
  (items) => {
    const map = new Map(items.map((item) => [item.dayOfWeek, item]));
    for (const row of workingHoursRows) {
      const entry = map.get(row.dayOfWeek);
      row.enabled = Boolean(entry);
      row.startTime = entry?.startTime ?? '09:00';
      row.endTime = entry?.endTime ?? '18:00';
    }
  },
  { immediate: true },
);

function startEdit(item: StaffItemDto): void {
  editingId.value = item.id;
  editingForm.fullName = item.fullName;
  editingForm.email = item.email;
  editingForm.role = item.role;
  editingForm.isActive = item.isActive;
}

function cancelEdit(): void {
  editingId.value = null;
  editingForm.fullName = undefined;
  editingForm.email = undefined;
  editingForm.role = undefined;
  editingForm.isActive = undefined;
}

async function createStaff(): Promise<void> {
  errorMessage.value = '';
  try {
    await crmApi.createStaff(createForm);
    createForm.email = '';
    createForm.fullName = '';
    createForm.role = 'staff';
    createForm.isActive = true;
    await refresh();
  } catch {
    errorMessage.value = 'Staff create failed.';
  }
}

async function saveStaff(staffId: string): Promise<void> {
  errorMessage.value = '';
  try {
    await crmApi.updateStaff(staffId, editingForm);
    cancelEdit();
    await refresh();
  } catch {
    errorMessage.value = 'Staff update failed.';
  }
}

async function deleteStaff(staffId: string): Promise<void> {
  errorMessage.value = '';
  try {
    await crmApi.deleteStaff(staffId);
    if (selectedStaffId.value === staffId) {
      selectedStaffId.value = null;
    }
    await refresh();
  } catch {
    errorMessage.value = 'Staff delete failed.';
  }
}

async function saveWorkingHours(): Promise<void> {
  if (!selectedStaffId.value) {
    return;
  }
  errorMessage.value = '';
  try {
    await crmApi.replaceWorkingHours(selectedStaffId.value, {
      items: workingHoursRows
        .filter((row) => row.enabled)
        .map((row) => ({
          dayOfWeek: row.dayOfWeek,
          startTime: row.startTime,
          endTime: row.endTime,
        })),
    });
    await refreshWorkingHours();
  } catch {
    errorMessage.value = 'Working hours update failed.';
  }
}

async function addTimeOff(): Promise<void> {
  if (!selectedStaffId.value) {
    return;
  }
  errorMessage.value = '';
  try {
    await crmApi.createTimeOff(selectedStaffId.value, {
      startsAtIso: new Date(timeOffForm.startsAtLocal).toISOString(),
      endsAtIso: new Date(timeOffForm.endsAtLocal).toISOString(),
      reason: timeOffForm.reason || undefined,
    });
    timeOffForm.startsAtLocal = '';
    timeOffForm.endsAtLocal = '';
    timeOffForm.reason = '';
    await refreshTimeOff();
  } catch {
    errorMessage.value = 'Time-off create failed.';
  }
}

async function removeTimeOff(timeOffId: string): Promise<void> {
  if (!selectedStaffId.value) {
    return;
  }
  errorMessage.value = '';
  try {
    await crmApi.deleteTimeOff(selectedStaffId.value, timeOffId);
    await refreshTimeOff();
  } catch {
    errorMessage.value = 'Time-off delete failed.';
  }
}
</script>

<template>
  <CrmShell>
    <section class="card">
      <span class="badge">Staff</span>
      <h1 class="h1">Team and schedule</h1>
      <p class="muted">Includes roles, working hours, and time-off.</p>
      <p v-if="errorMessage" class="muted">{{ errorMessage }}</p>
    </section>

    <section class="card">
      <h3 style="margin-top: 0">Create staff member</h3>
      <div class="grid-2">
        <input v-model="createForm.fullName" class="btn" type="text" placeholder="Full name">
        <input v-model="createForm.email" class="btn" type="email" placeholder="Email">
        <select v-model="createForm.role" class="btn">
          <option value="owner">owner</option>
          <option value="staff">staff</option>
        </select>
        <label class="btn" style="display: flex; align-items: center; gap: 8px">
          <input v-model="createForm.isActive" type="checkbox">
          Active
        </label>
      </div>
      <div class="btn-row" style="margin-top: 10px">
        <button class="btn primary" @click="createStaff">Create</button>
      </div>
    </section>

    <section class="card">
      <table class="table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          <tr v-if="pending">
            <td colspan="5">Loading staff...</td>
          </tr>
          <tr v-for="member in staff" :key="member.id">
            <td>
              <template v-if="editingId === member.id">
                <input v-model="editingForm.fullName" class="btn" type="text">
              </template>
              <template v-else>{{ member.fullName }}</template>
            </td>
            <td>
              <template v-if="editingId === member.id">
                <input v-model="editingForm.email" class="btn" type="email">
              </template>
              <template v-else>{{ member.email }}</template>
            </td>
            <td>
              <template v-if="editingId === member.id">
                <select v-model="editingForm.role" class="btn">
                  <option value="owner">owner</option>
                  <option value="staff">staff</option>
                </select>
              </template>
              <template v-else>{{ member.role }}</template>
            </td>
            <td>
              <span :class="member.isActive ? 'badge ok' : 'badge warn'">
                {{ member.isActive ? 'active' : 'inactive' }}
              </span>
            </td>
            <td>
              <div class="btn-row">
                <button class="btn" @click="selectedStaffId = member.id">Schedule</button>
                <button v-if="editingId !== member.id" class="btn" @click="startEdit(member)">Edit</button>
                <button v-if="editingId === member.id" class="btn primary" @click="saveStaff(member.id)">Save</button>
                <button v-if="editingId === member.id" class="btn" @click="cancelEdit">Cancel</button>
                <button class="btn" @click="deleteStaff(member.id)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-if="selectedStaffId" class="card grid-2">
      <article class="card">
        <h3 style="margin-top: 0">Working hours</h3>
        <table class="table">
          <thead><tr><th>Day</th><th>Enabled</th><th>Start</th><th>End</th></tr></thead>
          <tbody>
            <tr v-for="row in workingHoursRows" :key="row.dayOfWeek">
              <td>{{ row.label }}</td>
              <td><input v-model="row.enabled" type="checkbox"></td>
              <td><input v-model="row.startTime" class="btn" type="time"></td>
              <td><input v-model="row.endTime" class="btn" type="time"></td>
            </tr>
          </tbody>
        </table>
        <div class="btn-row" style="margin-top: 10px">
          <button class="btn primary" @click="saveWorkingHours">Save working hours</button>
        </div>
      </article>

      <article class="card">
        <h3 style="margin-top: 0">Time-off</h3>
        <div class="grid-2">
          <input v-model="timeOffForm.startsAtLocal" class="btn" type="datetime-local">
          <input v-model="timeOffForm.endsAtLocal" class="btn" type="datetime-local">
          <input v-model="timeOffForm.reason" class="btn" type="text" placeholder="Reason">
          <button class="btn primary" @click="addTimeOff">Add time-off</button>
        </div>
        <table class="table" style="margin-top: 10px">
          <thead><tr><th>Start</th><th>End</th><th>Reason</th><th></th></tr></thead>
          <tbody>
            <tr v-for="item in timeOffItems" :key="item.id">
              <td>{{ new Date(item.startsAtIso).toLocaleString('de-DE') }}</td>
              <td>{{ new Date(item.endsAtIso).toLocaleString('de-DE') }}</td>
              <td>{{ item.reason ?? '-' }}</td>
              <td><button class="btn" @click="removeTimeOff(item.id)">Delete</button></td>
            </tr>
          </tbody>
        </table>
      </article>
    </section>
  </CrmShell>
</template>
