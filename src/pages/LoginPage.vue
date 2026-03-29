<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="text-h5 text-center pa-6">FleetControl</v-card-title>
          <v-card-subtitle class="text-center pb-4">
            Gestión de flotas de transporte
          </v-card-subtitle>

          <v-card-text>
            <v-form @submit.prevent="onSubmit">
              <v-text-field
                v-model="email"
                label="Correo electrónico"
                type="email"
                :error-messages="errors.email"
                autocomplete="email"
                required
                data-testid="login-email"
              />

              <v-text-field
                v-model="password"
                label="Contraseña"
                type="password"
                :error-messages="errors.password"
                autocomplete="current-password"
                required
                data-testid="login-password"
              />

              <v-btn
                type="submit"
                color="primary"
                block
                :loading="isSubmitting"
                :disabled="isSubmitting"
                class="mt-4"
                data-testid="login-submit"
              >
                Iniciar sesión
              </v-btn>

              <div class="text-center mt-4">
                <v-btn
                  variant="text"
                  color="primary"
                  size="small"
                  to="/registro"
                  data-testid="login-register-link"
                >
                  Crear cuenta
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useAuth } from '@/composables/use-auth.js'

const { login } = useAuth()

const loginSchema = toTypedSchema(
  z.object({
    email: z
      .string({ required_error: 'El correo es obligatorio' })
      .email('Formato de correo inválido'),
    password: z
      .string({ required_error: 'La contraseña es obligatoria' })
      .min(6, 'Mínimo 6 caracteres'),
  }),
)

const { handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: loginSchema,
})

const { value: email } = useField('email')
const { value: password } = useField('password')

const onSubmit = handleSubmit(async values => {
  await login(values.email, values.password)
})
</script>
