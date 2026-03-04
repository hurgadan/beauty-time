<script setup lang="ts">
import BookingFlowShell from '~/components/composed/BookingFlowShell.vue';

const slug = useBookingSlug();
const route = useRoute();
const router = useRouter();
const bookingApi = useBookingApi();
const { flow } = useBookingFlowState();

if (!flow.value.clientEmail || !flow.value.slotIso || !flow.value.service) {
  await navigateTo(`/book/${slug}/contact`);
}

const verifying = ref(false);
const sending = ref(false);
const errorMessage = ref('');

const otpExpired = computed(() => route.query.state === 'otp-expired');

async function resendCode(): Promise<void> {
  sending.value = true;
  errorMessage.value = '';

  try {
    await bookingApi.sendMagicLink({
      tenantSlug: slug,
      email: flow.value.clientEmail,
    });
    await router.push(`/book/${slug}/verify`);
  } catch {
    errorMessage.value = 'Failed to resend code.';
  } finally {
    sending.value = false;
  }
}

async function verifyAndCreate(): Promise<void> {
  if (flow.value.otp.length !== 6) {
    errorMessage.value = 'OTP must be 6 digits.';
    return;
  }
  if (!flow.value.service || !flow.value.slotIso) {
    errorMessage.value = 'Booking data is incomplete. Please restart flow.';
    return;
  }

  verifying.value = true;
  errorMessage.value = '';

  try {
    const verifyResult = await bookingApi.verifyOtp({
      tenantSlug: slug,
      email: flow.value.clientEmail,
      otp: flow.value.otp,
    });

    if (!verifyResult.verified) {
      await router.push({
        path: `/book/${slug}/verify`,
        query: { state: 'otp-expired' },
      });
      return;
    }

    const appointment = await bookingApi.createPublicAppointment(slug, {
      clientName: flow.value.clientName,
      clientEmail: flow.value.clientEmail,
      serviceId: flow.value.service.id,
      ...(flow.value.staff ? { staffId: flow.value.staff.id } : {}),
      startsAtIso: flow.value.slotIso,
    });

    flow.value.appointmentId = appointment.id;
    await navigateTo(`/book/${slug}/success`);
  } catch {
    errorMessage.value = 'OTP validation failed. Try again.';
  } finally {
    verifying.value = false;
  }
}
</script>

<template>
  <BookingFlowShell :step="6" title="Verify with OTP">
    <section class="card">
      <p class="muted">Magic link sent to {{ flow.clientEmail }}. Enter 6-digit code.</p>
      <div class="field">
        <label>OTP</label>
        <input v-model="flow.otp" class="input" maxlength="6" placeholder="123456">
      </div>
      <div v-if="otpExpired" class="alert error">OTP expired. Request a new code to continue.</div>
      <div v-else class="alert warn">OTP expires in 10 minutes. Resend is available.</div>
      <div v-if="errorMessage" class="alert error">{{ errorMessage }}</div>
      <div class="btn-row" style="margin-top: 10px">
        <NuxtLink class="btn" :to="`/book/${slug}/contact`">Back</NuxtLink>
        <button class="btn" :disabled="sending" @click="resendCode">
          {{ sending ? 'Resending...' : 'Resend OTP' }}
        </button>
        <button class="btn primary" :disabled="verifying" @click="verifyAndCreate">
          {{ verifying ? 'Verifying...' : 'Verify and confirm' }}
        </button>
      </div>
    </section>
  </BookingFlowShell>
</template>
