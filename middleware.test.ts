import { describe, it, expect } from 'vitest'
import { resolveRedirect } from './middleware'

describe('resolveRedirect', () => {
  it('redirects unauthenticated user to login', () => {
    expect(resolveRedirect('/', false, false)).toBe('login')
  })
  it('allows unauthenticated user on /login', () => {
    expect(resolveRedirect('/login', false, false)).toBeNull()
  })
  it('redirects non-admin from /admin to home', () => {
    expect(resolveRedirect('/admin', true, false)).toBe('home')
  })
  it('allows admin on /admin', () => {
    expect(resolveRedirect('/admin', true, true)).toBeNull()
  })
  it('allows authenticated user on /', () => {
    expect(resolveRedirect('/', true, false)).toBeNull()
  })
  it('allows unauthenticated user on /auth/callback', () => {
    expect(resolveRedirect('/auth/callback', false, false)).toBeNull()
  })
})
