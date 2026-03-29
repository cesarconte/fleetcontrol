<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4" class="text-center">
        <h1 class="text-h1 text-medium-emphasis mb-4">404</h1>
        <p class="text-body-1 mb-6">Página no encontrada</p>
        <v-btn color="primary" :to="{ name: 'Dashboard' }" data-testid="back-home">
          Volver al inicio
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
</script>
