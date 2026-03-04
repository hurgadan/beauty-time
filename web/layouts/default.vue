<template>
  <div class="booking-bg booking-layout">
    <main class="booking-main">
      <slot />
    </main>
    <footer class="booking-footer">
      <NuxtLink class="booking-footer-link" to="/privacy/data-request">
        Privacy / GDPR request
      </NuxtLink>
    </footer>
  </div>
</template>
