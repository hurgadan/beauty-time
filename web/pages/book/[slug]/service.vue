<script setup lang="ts">
import BookingFlowShell from '~/components/composed/BookingFlowShell.vue';

const slug = useBookingSlug();
const bookingApi = useBookingApi();
const { flow } = useBookingFlowState();
const { data: config, pending } = await useAsyncData(`booking-config-services-${slug}`, () =>
  bookingApi.getBookingConfig(slug),
);

function selectService(serviceId: string): void {
  const selectedService = config.value?.services.find((item) => item.id === serviceId);
  if (!selectedService) {
    return;
  }

  flow.value.service = selectedService;
}
</script>

<template>
  <BookingFlowShell :step="2" title="Choose service">
    <section class="card">
      <p v-if="pending" class="muted">Loading services...</p>
      <div class="btn-row">
        <button
          v-for="item in config?.services ?? []"
          :key="item.id"
          class="btn"
          :class="{ primary: flow.service?.id === item.id }"
          @click="selectService(item.id)"
        >
          {{ item.name }} · {{ item.durationMinutes }}m · €{{ (item.priceCents / 100).toFixed(0) }}
        </button>
      </div>
      <div v-if="!pending && (config?.services?.length ?? 0) === 0" class="alert error">
        No services are available for online booking.
      </div>
      <div class="btn-row" style="margin-top: 10px">
        <NuxtLink class="btn" :to="`/book/${slug}`">Back</NuxtLink>
        <NuxtLink class="btn primary" :to="`/book/${slug}/specialist`" :aria-disabled="!flow.service">
          Continue
        </NuxtLink>
      </div>
    </section>
  </BookingFlowShell>
</template>
