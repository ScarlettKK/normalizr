import Structure from './Structure'
import SchemaEntity from '../schema/SchemaEntity'

export default class Normalize extends Structure {
  constructor (data, entity) {
    super(data, entity)
    this.normalizedData = {}
    this.normalizedData.entities = {}
  }

  normalizeProcessing () {
    const normalizedData = this.normalizedData
    const entity = this.entity
    const data = this.data

    normalizedData.result = this.getIDFromData(data, entity)

    this.buildEntitiesForm(data, entity)

    return normalizedData
  }

  getIDFromData (data, entity) {
    if (!(data instanceof Array)) return entity.getDataID(data)

    const result = []
    const currentEntity = entity[0]

    data.forEach((dataItem) => {
      const itemID = currentEntity.getDataID(dataItem)
      result.push(itemID)
    })

    return result
  }

  buildEntitiesForm (data, entity) {
    if (entity instanceof Array) { // 可能会entity与data不同步为[]
      const currentEntity = entity[0]

      data.forEach((dataItem) => {
        this.buildEntryFrom(dataItem, currentEntity)
      })
    } else {
      this.buildEntryFrom(data, entity)
    }
  }

  buildEntryFrom (data, entity) {
    const itemID = entity.getDataID(data)
    const entityName = entity.name
    if (this.isDataItemAlreadyNormalized(entityName, itemID)) { return }

    const entities = this.normalizedData.entities
    let targetEntity = entities[entityName]
    if (!targetEntity) {
      entities[entityName] = {}
    }
    targetEntity = entities[entityName]
    targetEntity[itemID] = {}
    const result = targetEntity[itemID]

    this.buildEntryItem(data, entity, result)
  }

  buildEntryItem (data, entity, result) {
    const entityParams = this.getEntityParams(entity)

    for (let key in data) {
      const dataItem = data[key]
      const isEntity = this.isEntity(key, entityParams)

      if (isEntity) {
        const entityItem = entityParams[key]
        this.handleKeyOfEntity(result, key, entityItem, dataItem)
      } else {
        result[key] = this.deepCopy(dataItem)
      }
    }
  }

  handleKeyOfEntity (result, key, entityItem, dataItem) {
    if (entityItem instanceof SchemaEntity || entityItem instanceof Array) {
      result[key] = this.getIDFromData(dataItem, entityItem)
      this.buildEntitiesForm(dataItem, entityItem)
    } else {
      result[key] = {}
      this.buildEntryItem(dataItem, entityItem, result[key])
    }
  }

  isDataItemAlreadyNormalized (entityName, id) { // 这个看看怎么抽象，重复了
    const entities = this.normalizedData.entities
    const entity = entities[entityName]

    if (!entity) return false

    const item = entity[id]

    if (!item) return false

    return true
  }
}
