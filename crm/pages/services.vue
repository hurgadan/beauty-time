<script setup lang="ts">
import CrmShell from '~/components/composed/CrmShell.vue';
import type { CreateServiceDto, Service, UpdateServiceDto } from '@hurgadan/beauty-time-crm-contracts';

const crmApi = useCrmApi();
const { data: services, pending, refresh } = await useAsyncData('services-list', () => crmApi.listServices());

const createForm = reactive<CreateServiceDto>({
  name: '',
  description: '',
  priceCents: 4900,
  durationMinutes: 45,
  bufferBeforeMinutes: 0,
  bufferAfterMinutes: 10,
  isActive: true,
});
const editingId = ref<string | null>(null);
const editingForm = reactive<UpdateServiceDto>({});
const errorMessage = ref('');

function startEdit(service: Service): void {
  editingId.value = service.id;
  editingForm.name = service.name;
  editingForm.description = service.description;
  editingForm.priceCents = service.priceCents;
  editingForm.durationMinutes = service.durationMinutes;
  editingForm.bufferBeforeMinutes = service.bufferBeforeMinutes;
  editingForm.bufferAfterMinutes = service.bufferAfterMinutes;
  editingForm.isActive = service.isActive;
}

function resetEdit(): void {
  editingId.value = null;
  editingForm.name = undefined;
  editingForm.description = undefined;
  editingForm.priceCents = undefined;
  editingForm.durationMinutes = undefined;
  editingForm.bufferBeforeMinutes = undefined;
  editingForm.bufferAfterMinutes = undefined;
  editingForm.isActive = undefined;
}

async function createService(): Promise<void> {
  errorMessage.value = '';
  try {
    await crmApi.createService({
      ...createForm,
      description: createForm.description?.trim() || undefined,
    });
    createForm.name = '';
    createForm.description = '';
    await refresh();
  } catch {
    errorMessage.value = 'Service create failed.';
  }
}

async function saveEdit(serviceId: string): Promise<void> {
  errorMessage.value = '';
  try {
    await crmApi.updateService(serviceId, editingForm);
    resetEdit();
    await refresh();
  } catch {
    errorMessage.value = 'Service update failed.';
  }
}

async function removeService(serviceId: string): Promise<void> {
  errorMessage.value = '';
  try {
    await crmApi.deleteService(serviceId);
    await refresh();
  } catch {
    errorMessage.value = 'Service delete failed.';
  }
}
</script>

<template>
  <CrmShell>
    <section class="card">
      <span class="badge">Services</span>
      <h1 class="h1">Pricing, duration, buffers</h1>
      <p v-if="errorMessage" class="muted">{{ errorMessage }}</p>
    </section>

    <section class="card">
      <h3 style="margin-top: 0">Create service</h3>
      <div class="grid-3">
        <input v-model="createForm.name" class="btn" type="text" placeholder="Service name">
        <input v-model.number="createForm.priceCents" class="btn" type="number" min="0" step="100" placeholder="Price cents">
        <input v-model.number="createForm.durationMinutes" class="btn" type="number" min="5" step="5" placeholder="Duration">
      </div>
      <div class="grid-3" style="margin-top: 8px">
        <input v-model.number="createForm.bufferBeforeMinutes" class="btn" type="number" min="0" step="5" placeholder="Buffer before">
        <input v-model.number="createForm.bufferAfterMinutes" class="btn" type="number" min="0" step="5" placeholder="Buffer after">
        <input v-model="createForm.description" class="btn" type="text" placeholder="Description">
      </div>
      <div class="btn-row" style="margin-top: 10px">
        <button class="btn primary" @click="createService">Create</button>
      </div>
    </section>

    <section class="card">
      <table class="table">
        <thead><tr><th>Name</th><th>Duration</th><th>Price</th><th>Buffers</th><th>Actions</th></tr></thead>
        <tbody>
          <tr v-if="pending">
            <td colspan="5">Loading services...</td>
          </tr>
          <tr v-for="item in services" :key="item.id">
            <td>
              <template v-if="editingId === item.id">
                <input v-model="editingForm.name" class="btn" type="text">
              </template>
              <template v-else>{{ item.name }}</template>
            </td>
            <td>
              <template v-if="editingId === item.id">
                <input v-model.number="editingForm.durationMinutes" class="btn" type="number" min="5" step="5">
              </template>
              <template v-else>{{ item.durationMinutes }}m</template>
            </td>
            <td>
              <template v-if="editingId === item.id">
                <input v-model.number="editingForm.priceCents" class="btn" type="number" min="0" step="100">
              </template>
              <template v-else>€{{ (item.priceCents / 100).toFixed(2) }}</template>
            </td>
            <td>{{ item.bufferBeforeMinutes }}m / {{ item.bufferAfterMinutes }}m</td>
            <td>
              <div class="btn-row">
                <button v-if="editingId !== item.id" class="btn" @click="startEdit(item)">Edit</button>
                <button v-if="editingId === item.id" class="btn primary" @click="saveEdit(item.id)">Save</button>
                <button v-if="editingId === item.id" class="btn" @click="resetEdit">Cancel</button>
                <button class="btn" @click="removeService(item.id)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </CrmShell>
</template>
