import SchemaEntity from '../schema/SchemaEntity'

export default class Structure {
  constructor (data, entity) {
    this.data = data
    this.entity = entity
  }

  deepCopy (data) {
    let copyResult
    copyResult = JSON.parse(JSON.stringify(data))
    return copyResult
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
