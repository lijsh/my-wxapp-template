import { pushTarget, popTarget } from './dep'
import { queueWatcher } from './schedule'

let uid = 0

export class Watcher {
  constructor(fn, ctx) {
    this.ctx = ctx
    ctx.$watchers = (ctx.$watchers || []).concat(this)
    this.getter = fn
    this.id = ++uid
    this.deps = []
    this.depIds = new Set()
    this.value = this.get()
  }
  get() {
    pushTarget(this)
    let value = this.getter()
    popTarget()
    return value
  }

  update() {
    queueWatcher(this)
  }

  run() {
    this.value = this.get()
  }

  addDep(dep) {
    const id = dep.id
    if (!this.depIds.has(id)) {
      this.depIds.add(id)
      this.deps.push(dep)
      dep.addSub(this)
    }
  }

  teardown() {
    let i = this.deps.length
    while (i--) {
      this.deps[i].removeSub(this)
    }
  }
}
