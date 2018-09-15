const queue = []
let has = {}
let waiting = false
const callbacks = []

function flushSchedulerQueue() {
  let watcher, id
  queue.forEach(watcher => {
    id = watcher.id
    has[id] = null
    watcher.run()
  })
  waiting = false
  has = null
  queue.length = 0
}

export function queueWatcher(watcher) {
  const id = watcher.id
  if (has[id]) return
  has[id] = true
  queue.push(watcher)
  if (!waiting) {
    waiting = true
    nextTick(flushSchedulerQueue)
  }
}

export function nextTick(cb) {
  return setTimeout(cb, 0)
}
