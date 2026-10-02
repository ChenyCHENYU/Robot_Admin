import { describe, expect, test } from 'bun:test'
import { getMicroAppConfig, getMicroAppUrl, normalizeMicroAppUrl } from '../src/config/microApps'

describe('micro-app trusted URL', () => {
  test('accepts an explicit HTTPS application URL', () => {
    expect(normalizeMicroAppUrl('https://logistics.example.com/app', false))
      .toBe('https://logistics.example.com/app')
  })

  test('allows local HTTP only during development', () => {
    expect(normalizeMicroAppUrl('http://127.0.0.1:3003', true))
      .toBe('http://127.0.0.1:3003/')
    expect(normalizeMicroAppUrl('http://127.0.0.1:3003', false)).toBeNull()
    expect(normalizeMicroAppUrl('http://logistics.example.com', true)).toBeNull()
  })

  test('rejects invalid, credentialed, and non-web URLs', () => {
    for (const url of ['', '//logistics.example.com', 'javascript:alert(1)',
      'https://user:secret@logistics.example.com', 'https://logistics.example.com/#token']) {
      expect(normalizeMicroAppUrl(url, false)).toBeNull()
    }
  })

  test('does not resolve inherited object properties as application IDs', () => {
    expect(getMicroAppConfig('__proto__')).toBeNull()
    expect(getMicroAppUrl('constructor')).toBeNull()
  })
})
