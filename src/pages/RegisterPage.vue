<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="text-h5 text-center pa-6">Crear cuenta</v-card-title>

          <v-card-text>
            <v-form @submit.prevent="onSubmit">
              <v-text-field
                v-model="fullName"
                label="Nombre completo"
                :error-messages="errors.full_name"
                autocomplete="name"
                required
                data-testid="register-name"
              />

              <v-text-field
                v-model="email"
                label="Correo electrónico"
                type="email"
                :error-messages="errors.email"
                autocomplete="email"
                required
                data-testid="register-email"
              />

              <v-text-field
                v-model="password"
                label="Contraseña"
                type="password"
                :error-messages="errors.password"
                autocomplete="new-password"
                required
                data-testid="register-password"
              />

              <v-text-field
                v-model="confirmPassword"
                label="Confirmar contraseña"
                type="password"
                :error-messages="errors.confirm_password"
                autocomplete="new-password"
                required
                data-testid="register-confirm-password"
              />

              <v-btn
                type="submit"
                color="primary"
                block
                :loading="isSubmitting"
                :disabled="isSubmitting"
                class="mt-4"
                data-testid="register-submit"
              >
                Crear cuenta
              </v-btn>

              <div class="text-center mt-4">
                <v-btn
                  variant="text"
                  color="primary"
                  size="small"
                  to="/login"
                  data-testid="register-login-link"
                >
                  Ya tengo cuenta
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

const { register } = useAuth()

const registerSchema = toTypedSchema(
  z
    .object({
      full_name: z
        .string({ required_error: 'El nombre es obligatorio' })
        .min(2, 'Mínimo 2 caracteres'),
      email: z
        .string({ required_error: 'El correo es obligatorio' })
        .email('Formato de correo inválido'),
      password: z
        .string({ required_error: 'La contraseña es obligatoria' })
        .min(6, 'Mínimo 6 caracteres'),
      confirm_password: z.string({ required_error: 'Confirma la contraseña' }),
    })
    .refine(data => data.password === data.confirm_password, {
      message: 'Las contraseñas no coinciden',
      path: ['confirm_password'],
    }),
)

const { handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: registerSchema,
})

const { value: fullName } = useField('full_name')
const { value: email } = useField('email')
const { value: password } = useField('password')
const { value: confirmPassword } = useField('confirm_password')

const onSubmit = handleSubmit(async values => {
  await register(values.email, values.password, {
    full_name: values.full_name,
  })
})
</script>
