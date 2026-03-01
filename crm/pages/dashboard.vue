<script setup lang="ts">
import CrmShell from '~/components/composed/CrmShell.vue';
const { appointments } = useCrmMockData();
</script>

<template>
  <CrmShell>
    <section class="card">
      <span class="badge">Europe/Berlin</span>
      <h1 class="h1">Today dashboard</h1>
      <p class="muted">6 appointments, 2 need confirmation.</p>
    </section>

    <section class="grid-3">
      <article class="card"><strong>Booked</strong><p class="h1">18</p></article>
      <article class="card"><strong>No-show risk</strong><p class="h1">3</p></article>
      <article class="card"><strong>Revenue</strong><p class="h1">€1,240</p></article>
    </section>

    <section class="card">
      <div class="btn-row" style="margin-bottom: 10px">
        <button class="btn primary">+ New appointment</button>
        <button class="btn">Send reminder</button>
      </div>
      <table class="table">
        <thead><tr><th>Time</th><th>Client</th><th>Service</th><th>Status</th></tr></thead>
        <tbody>
          <tr v-for="item in appointments" :key="item.id">
            <td>{{ item.time }}</td>
            <td>{{ item.client }}</td>
            <td>{{ item.service }}</td>
            <td>{{ item.status }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </CrmShell>
</template>
