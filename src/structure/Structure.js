import SchemaEntity from '../schema/SchemaEntity'

export default class Structure {
  constructor (data, entity) {
    this.data = this.deepCopy(data)
    this.entity = entity
  }

  isObject (obj) {
    return typeof obj === 'object' && obj != null
  }

  deepCopy (source, hash = new WeakMap()) { /// /////////////////////////////
    if (!this.isObject(source)) return source
    if (hash.has(source)) return hash.get(source) // 新增代码，查哈希表

    var target = Array.isArray(source) ? [] : {}
    hash.set(source, target) // 新增代码，哈希表设值

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (this.isObject(source[key])) {
          target[key] = this.deepCopy(source[key], hash) // 新增代码，传入哈希表
        } else {
          target[key] = source[key]
        }
      }
    }
    return target
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

  isDataItemAlreadyStructured (entityName, id) {
    const entities = this.structuredFrom
    const entity = entities[entityName]
    if (!entity) return false

    const item = entity[id]
    if (!item) return false

    return true
  }
}
