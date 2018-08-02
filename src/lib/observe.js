export class Dep {
  static target = null
  constructor() {
    this.subs = []
  }

  depend() {
    if (Dep.target && !this.subs.includes(Dep.target)) {
      this.subs.push(Dep.target)
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
      console.log(`set ${key}`)
      dep.notify()
    }
  })
}

export function watch(exp) {
  Dep.target = exp
  Dep.target()
  Dep.target = null
}