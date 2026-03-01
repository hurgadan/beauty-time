<script setup lang="ts">
const route = useRoute();

const nav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/appointments', label: 'Appointments' },
  { to: '/clients/sofia-ludwig', label: 'Clients' },
  { to: '/staff', label: 'Staff' },
  { to: '/services', label: 'Services' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/settings', label: 'Settings' },
];

const mobileNav = [
  { to: '/dashboard', label: 'Today' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/clients/sofia-ludwig', label: 'Clients' },
  { to: '/settings', label: 'More' },
];

function isActive(path: string): boolean {
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
        <NuxtLink v-for="item in mobileNav" :key="item.to" :to="item.to" :class="{ active: route.path.startsWith(item.to) }">
          {{ item.label }}
        </NuxtLink>
      </nav>
    </main>
  </div>
</template>
