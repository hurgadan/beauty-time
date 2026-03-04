<script setup lang="ts">
import BookingFlowShell from '~/components/composed/BookingFlowShell.vue';

const slug = useBookingSlug();
const bookingApi = useBookingApi();
const { flow } = useBookingFlowState();
const { data: config, pending } = await useAsyncData(`booking-config-staff-${slug}`, () =>
  bookingApi.getBookingConfig(slug),
);

if (!flow.value.service) {
  await navigateTo(`/book/${slug}/service`);
}

function selectAny(): void {
  flow.value.staff = null;
}

function selectStaff(staffId: string): void {
  const selectedStaff = config.value?.staff.find((item) => item.id === staffId);
  if (!selectedStaff) {
    return;
  }

  flow.value.staff = selectedStaff;
}
</script>

<template>
  <BookingFlowShell :step="3" title="Choose specialist">
    <section class="card">
      <p v-if="pending" class="muted">Loading specialists...</p>
      <div class="btn-row">
        <button class="btn" :class="{ primary: !flow.staff }" @click="selectAny">Any available</button>
        <button
          v-for="item in config?.staff ?? []"
          :key="item.id"
          class="btn"
          :class="{ primary: flow.staff?.id === item.id }"
          @click="selectStaff(item.id)"
        >
          {{ item.fullName }} ({{ item.role }})
        </button>
      </div>
      <div class="alert ok">
        {{ flow.staff ? `${flow.staff.fullName} selected.` : 'Any available selected for earliest slot.' }}
      </div>
      <div class="btn-row" style="margin-top: 10px">
        <NuxtLink class="btn" :to="`/book/${slug}/service`">Back</NuxtLink>
        <NuxtLink class="btn primary" :to="`/book/${slug}/datetime`">Continue</NuxtLink>
      </div>
    </section>
  </BookingFlowShell>
</template>
