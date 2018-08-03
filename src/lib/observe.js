export class Dep {
  static target = null
  static page = null
  constructor() {
    this.subs = []
  }

  depend() {
    if (Dep.target && !this.subs.includes(Dep.target)) {
      this.subs.push(Dep.target)
      this.addPageDep()
    }
  }

  remove(route) {
    this.subs = this.subs.filter(sub => sub.route !== route)
  }

  addPageDep() {
    if (Dep.page) {
      Dep.page.deps = Dep.page.deps || []
      if (!Dep.page.deps.includes(this)) {
        Dep.page.deps.push(this)
      }
    }
  }

  notify() {
    this.subs.forEach(sub => sub())
  }
}

export function observe(data) {
  if (!data || typeof data !== 'object') return
  Object.keys(data).forEach(key => {
    defineReactive(data, key, data[key])
  })
}

function defineReactive(data, key, val) {
  observe(val)
  const dep = new Dep
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: false,
    get() {
      dep.depend()
      return val
    },
    set(newValue) {
      if (val === newValue) return
      val = newValue
      observe(val)
      dep.notify()
    }
  })
}

export function watch(exp, page) {
  exp.route = page.route
  Dep.target = exp
  Dep.page = page
  Dep.target()
  Dep.target = null
  Dep.page = null
}