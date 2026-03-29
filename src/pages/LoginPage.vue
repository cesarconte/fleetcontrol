<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="text-h5 text-center pa-6">
            FleetControl
          </v-card-title>
          <v-card-text>
            <v-form ref="formRef" @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                label="Correo electrónico"
                type="email"
                :rules="emailRules"
                required
                data-testid="login-email"
              />
              <v-text-field
                v-model="password"
                label="Contraseña"
                type="password"
                :rules="passwordRules"
                required
                data-testid="login-password"
              />
              <v-btn
                type="submit"
                color="primary"
                block
                :loading="isLoading"
                :disabled="isLoading"
                class="mt-4"
                data-testid="login-submit"
              >
                Iniciar sesión
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'

const formRef = ref(null)
const email = ref('')
const password = ref('')
const isLoading = ref(false)

const emailRules = [
  v => !!v || 'El correo es obligatorio',
  v => /.+@.+\..+/.test(v) || 'Formato de correo inválido',
]

const passwordRules = [
  v => !!v || 'La contraseña es obligatoria',
  v => v.length >= 6 || 'Mínimo 6 caracteres',
]

async function handleLogin() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  isLoading.value = true
  try {
    // TODO 2026-03-29 #1: Implement auth service call
    void email.value
  } finally {
    isLoading.value = false
  }
}
</script>
