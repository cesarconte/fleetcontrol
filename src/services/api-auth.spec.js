import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase before importing
vi.mock('@/services/supabase-client.js', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
  },
}))

import { apiAuth } from './api-auth.js'
import { supabase } from '@/services/supabase-client.js'

const mockUser = { id: '1', email: 'test@fleetcontrol.es' }

describe('apiAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('debería llamar signInWithPassword con email y password', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await apiAuth.login('test@fleetcontrol.es', 'pass123')

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@fleetcontrol.es',
        password: 'pass123',
      })
      expect(result.user).toEqual(mockUser)
    })

    it('debería lanzar error si signInWithPassword falla', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid credentials' },
      })

      await expect(apiAuth.login('bad@test.com', 'wrong')).rejects.toEqual({
        message: 'Invalid credentials',
      })
    })
  })

  describe('register', () => {
    it('debería llamar signUp con email, password y metadata', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await apiAuth.register('new@test.com', 'pass123', {
        full_name: 'Nuevo Usuario',
      })

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@test.com',
        password: 'pass123',
        options: {
          data: { full_name: 'Nuevo Usuario' },
        },
      })
      expect(result.user).toEqual(mockUser)
    })

    it('debería lanzar error si signUp falla', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Email already registered' },
      })

      await expect(apiAuth.register('dup@test.com', 'pass')).rejects.toEqual({
        message: 'Email already registered',
      })
    })
  })

  describe('logout', () => {
    it('debería llamar signOut', async () => {
      supabase.auth.signOut.mockResolvedValue({ error: null })

      await apiAuth.logout()

      expect(supabase.auth.signOut).toHaveBeenCalled()
    })

    it('debería lanzar error si signOut falla', async () => {
      supabase.auth.signOut.mockResolvedValue({
        error: { message: 'Session expired' },
      })

      await expect(apiAuth.logout()).rejects.toEqual({
        message: 'Session expired',
      })
    })
  })

  describe('getSession', () => {
    it('debería retornar la sesión actual', async () => {
      const mockSession = { user: mockUser, access_token: 'abc' }
      supabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      const result = await apiAuth.getSession()

      expect(result).toEqual(mockSession)
    })

    it('debería retornar null si no hay sesión', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const result = await apiAuth.getSession()

      expect(result).toBeNull()
    })
  })

  describe('resetPassword', () => {
    it('debería llamar resetPasswordForEmail', async () => {
      supabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      })

      await apiAuth.resetPassword('test@fleetcontrol.es')

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@fleetcontrol.es', {
        redirectTo: expect.stringContaining('/reset-password'),
      })
    })

    it('debería lanzar error si resetPassword falla', async () => {
      supabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      })

      await expect(apiAuth.resetPassword('nobody@test.com')).rejects.toEqual({
        message: 'User not found',
      })
    })
  })
})
