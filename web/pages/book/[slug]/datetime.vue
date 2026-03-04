<script setup lang="ts">
import BookingFlowShell from '~/components/composed/BookingFlowShell.vue';

const slug = useBookingSlug();
const route = useRoute();
const router = useRouter();
const bookingApi = useBookingApi();
const { flow } = useBookingFlowState();

if (!flow.value.service) {
  await navigateTo(`/book/${slug}/service`);
}

const dateInput = ref(flow.value.dateIso);
const selectedSlotIso = ref(flow.value.slotIso);
const loadingSlots = ref(false);
const slots = ref<{ startsAtIso: string; available: boolean }[]>([]);

const noSlots = computed(
  () =>
    route.query.state === 'no-slots' ||
    (!loadingSlots.value && slots.value.length > 0 && !slots.value.some((item) => item.available)),
);

async function loadSlots(): Promise<void> {
  if (!flow.value.service) {
    return;
  }

  loadingSlots.value = true;
  try {
    slots.value = await bookingApi.queryAvailability(slug, {
      serviceId: flow.value.service.id,
      ...(flow.value.staff ? { staffId: flow.value.staff.id } : {}),
      dateIso: dateInput.value,
    });
  } finally {
    loadingSlots.value = false;
  }
}

await loadSlots();

watch(dateInput, async (value) => {
  flow.value.dateIso = value;
  selectedSlotIso.value = '';
  flow.value.slotIso = '';
  await loadSlots();
});

function pickSlot(startsAtIso: string, available: boolean): void {
  if (!available) {
    return;
  }

  selectedSlotIso.value = startsAtIso;
  flow.value.slotIso = startsAtIso;
}

async function continueNext(): Promise<void> {
  if (!flow.value.slotIso) {
    await router.push({
      path: `/book/${slug}/datetime`,
      query: { state: 'no-slots' },
    });
    return;
  }

  await navigateTo(`/book/${slug}/contact`);
}
</script>

<template>
  <BookingFlowShell :step="4" title="Choose date and time">
    <section class="card">
      <div class="field">
        <label>Date</label>
        <input v-model="dateInput" class="input" type="date">
      </div>
      <div class="slot-grid">
        <button
          v-for="slot in slots"
          :key="slot.startsAtIso"
          class="slot"
          :class="{ active: selectedSlotIso === slot.startsAtIso, disabled: !slot.available }"
          @click="pickSlot(slot.startsAtIso, slot.available)"
        >
          {{ new Date(slot.startsAtIso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) }}
        </button>
      </div>
      <div v-if="loadingSlots" class="alert warn">Loading available slots...</div>
      <div v-else-if="noSlots" class="alert error">No slots available for selected day. Choose another date.</div>
      <div v-else-if="!flow.slotIso" class="alert warn">Select a time slot to continue.</div>
      <div class="btn-row" style="margin-top: 10px">
        <NuxtLink class="btn" :to="`/book/${slug}/specialist`">Back</NuxtLink>
        <button class="btn primary" @click="continueNext">Continue</button>
      </div>
    </section>
  </BookingFlowShell>
</template>
