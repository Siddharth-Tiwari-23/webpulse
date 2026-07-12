// Track previous statuses to detect UP↔DOWN transitions
const prevStatuses = new Map()

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

export function checkAndNotify(websites) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  websites.forEach((site) => {
    const prev = prevStatuses.get(site.id)
    const curr = site.status

    if (prev !== undefined && prev !== curr) {
      if (curr === 'DOWN') {
        new Notification(`🔴 ${site.name} is DOWN`, {
          body: `${site.url} is no longer responding.`,
          icon: '/pulse.svg',
        })
      } else if (curr === 'UP') {
        new Notification(`🟢 ${site.name} is back UP`, {
          body: `${site.url} is responding again.`,
          icon: '/pulse.svg',
        })
      }
    }

    prevStatuses.set(site.id, curr)
  })
}
