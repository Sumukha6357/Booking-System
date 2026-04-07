import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '',
      push: vi.fn(),
      pop: vi.fn(),
      reload: vi.fn(),
      back: vi.fn(),
      prefetch: vi.fn(),
      beforePopState: vi.fn(),
      events: {
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
      },
    }
  },
}))

class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3
  readyState = 1
  addEventListener = vi.fn()
  removeEventListener = vi.fn()
  send = vi.fn()
  close = vi.fn()
  constructor(public url: string) {}
}

global.WebSocket = MockWebSocket as any
