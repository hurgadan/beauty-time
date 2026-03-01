<script setup lang="ts">
import CrmShell from '~/components/composed/CrmShell.vue';
</script>

<template>
  <CrmShell>
    <section class="card">
      <span class="badge">Services</span>
      <h1 class="h1">Pricing, duration, buffers</h1>
    </section>

    <section class="card">
      <table class="table">
        <thead><tr><th>Name</th><th>Duration</th><th>Price</th><th>Buffer</th></tr></thead>
        <tbody>
          <tr><td>Haircut + Styling</td><td>45m</td><td>€49</td><td>10m</td></tr>
          <tr><td>Manicure Premium</td><td>60m</td><td>€55</td><td>10m</td></tr>
        </tbody>
      </table>
    </section>
  </CrmShell>
</template>
