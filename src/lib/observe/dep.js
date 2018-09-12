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