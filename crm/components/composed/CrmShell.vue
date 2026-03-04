<script setup lang="ts">
const route = useRoute();

const nav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/appointments', label: 'Appointments' },
  { to: '/clients/a1234567-89ab-7def-8123-456789abc203', label: 'Clients' },
  { to: '/staff', label: 'Staff' },
  { to: '/services', label: 'Services' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/settings', label: 'Settings' },
];

function isActive(path: string): boolean {
  if (path.startsWith('/clients')) {
    return route.path.startsWith('/clients');
  }

  return route.path === path;
}
</script>

<template>
  <div class="crm-shell">
    <aside class="sidebar">
      <h1 class="brand">Beauty-Time</h1>
      <p class="muted">CRM</p>
      <nav class="nav">
        <NuxtLink v-for="item in nav" :key="item.to" :to="item.to" :class="{ active: isActive(item.to) }">
          {{ item.label }}
        </NuxtLink>
      </nav>
    </aside>

    <main class="main">
      <slot />
      <nav class="mobile-nav">
        <NuxtLink v-for="item in nav" :key="item.to" :to="item.to" :class="{ active: isActive(item.to) }">
          {{ item.label }}
        </NuxtLink>
      </nav>
    </main>
  </div>
</template>
