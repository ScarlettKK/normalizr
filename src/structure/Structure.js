import SchemaEntity from '../schema/SchemaEntity'

export default class Structure {
  constructor (data, entity) {
    this.data = this.deepCopy(data)
    this.entity = entity
  }

  isObject (obj) {
    return typeof obj === 'object' && obj !== null
  }

  deepCopy (data, hash = new WeakMap()) {
    if (!this.isObject(data)) return data
    if (hash.has(data)) return hash.get(data)

    var result = new data.constructor()
    hash.set(data, result)

    for (var key in data) {
      const value = data[key]
      if (this.isObject(value)) {
        result[key] = this.deepCopy(value, hash)
      } else {
        result[key] = data[key]
      }
    }
    return result
  }

  getEntityParams (entity) {
    if (entity instanceof SchemaEntity) { return entity.entityParams } else { return entity }
  }

  isEntity (key, entityParams) {
    for (let e in entityParams) {
      if (e === key) return true
    }
    return false
  }
}
