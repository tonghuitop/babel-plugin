class Scope {
  constructor(parentScope) {
    this.parent = parentScope
    this.declarations = []
  }

  set(name, value) {
    this.declarations[name] = value
  }

  getLocal(name) {
    return this.declarations[name]
  }

  get(name) {
    let res = this.getLocal(name)
    if (res === undefined && this.parent) {
      res = this.parent.get(name)
    }
    return res
  }

  has(name) {
    return !!this.getLocal(name)
  }
}

module.exports = Scope