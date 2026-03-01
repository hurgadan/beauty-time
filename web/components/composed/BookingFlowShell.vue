<script setup lang="ts">
defineProps<{
  step: number;
  title: string;
  subtitle?: string;
}>();

const steps = [
  'Landing',
  'Service',
  'Specialist',
  'Date & Time',
  'Contact',
  'OTP',
  'Success',
  'Reminder confirm',
];
</script>

<template>
  <div class="booking-wrap">
    <section class="card">
      <span class="badge">Booking flow</span>
      <h1 class="h1">{{ title }}</h1>
      <p v-if="subtitle" class="muted">{{ subtitle }}</p>
      <div class="step-row" style="margin-top: 10px">
        <span v-for="(item, index) in steps" :key="item" class="step" :class="{ active: step === index + 1 }">
          {{ index + 1 }} {{ item }}
        </span>
      </div>
    </section>

    <slot />
  </div>
</template>
