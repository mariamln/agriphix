import { createRoot } from 'react-dom/client'

function showFatalError(message) {
  const rootEl = document.getElementById('root')
  if (!rootEl) return
  const safe = String(message || 'Unknown startup error')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  rootEl.innerHTML = `
    <div style="padding: 24px; font-family: system-ui, sans-serif; max-width: 720px; margin: 40px auto;">
      <h1 style="font-size: 20px; color: #991b1b; margin: 0 0 12px;">Agriphix failed to start</h1>
      <pre style="color: #334155; line-height: 1.5; margin: 0 0 16px; white-space: pre-wrap; word-break: break-word; font-size: 13px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">${safe}</pre>
      <button type="button" onclick="location.reload()" style="padding: 8px 16px; background: #047857; color: white; border: none; border-radius: 8px; cursor: pointer;">
        Reload
      </button>
    </div>
  `
}

async function clearDevServiceWorkers() {
  if (import.meta.env.PROD) return
  if (!('serviceWorker' in navigator)) return
  const registrations = await navigator.serviceWorker.getRegistrations()
  await Promise.all(registrations.map((r) => r.unregister()))
  if ('caches' in window) {
    const keys = await caches.keys()
    await Promise.all(keys.map((key) => caches.delete(key)))
  }
}

async function setupServiceWorker() {
  await clearDevServiceWorkers()
  if (import.meta.env.PROD) {
    const { registerSW } = await import('virtual:pwa-register')
    registerSW({ immediate: true })
  }
}

async function boot() {
  const rootEl = document.getElementById('root')
  if (!rootEl) {
    showFatalError('Root element #root was not found.')
    return
  }

  try {
    await import('@/index.css')
    const [{ default: React }, { default: App }] = await Promise.all([
      import('react'),
      import('@/App.jsx'),
    ])

    createRoot(rootEl).render(React.createElement(App))

    void setupServiceWorker()
      .catch((err) => console.warn('[Agriphix] Service worker setup skipped:', err))
      .then(async () => {
        const { bootstrapGoogleRedirectSignIn } = await import('@/lib/googleRedirectBootstrap')
        return bootstrapGoogleRedirectSignIn()
      })
      .catch((err) => console.warn('[Agriphix] Google auth bootstrap skipped:', err))
  } catch (err) {
    console.error('[Agriphix] Startup failed:', err)
    showFatalError(err?.stack || err?.message || String(err))
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('[Agriphix] Uncaught error:', event.error || event.message)
  })
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Agriphix] Unhandled rejection:', event.reason)
  })
}

void boot()

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    window.parent?.postMessage({ type: 'sandbox:beforeUpdate' }, '*')
  })
  import.meta.hot.on('vite:afterUpdate', () => {
    window.parent?.postMessage({ type: 'sandbox:afterUpdate' }, '*')
  })
}
