import Structure from './Structure'
import SchemaEntity from '../schema/SchemaEntity'

export default class Normalize extends Structure {
  constructor (data, entity) {
    super(data, entity)
    this.normalizedData = {}
    this.normalizedData.entities = {}
    this.structuredFrom = this.normalizedData.entities
  }

  normalizeProcessing () {
    const normalizedData = this.normalizedData
    const entity = this.entity
    const data = this.data

    normalizedData.result = this.getIDFromData(data, entity)
    this.buildEntitiesForm(data, entity)

    return normalizedData
  }

  getIDFromData (data, entity) { // 参数个数
    if (!(data instanceof Array)) return entity.getDataID(data)

    const result = []
    const currentEntity = entity[0]

    data.forEach((item) => {
      const itemID = currentEntity.getDataID(item)
      result.push(itemID)
    })

    return result
  }

  buildEntitiesForm (data, entity) {
    if (entity instanceof Array) { // 可能会entity与data不同步为[]
      const currentEntity = entity[0]
      data.forEach((item) => {
        this.buildEntityFrom(item, currentEntity)
      })
    } else {
      this.buildEntityFrom(data, entity)
    }
  }

  buildEntityFrom (data, entity) {
    const entityName = entity.name
    const itemID = entity.getDataID(data)
    if (this.isDataItemAlreadyStructured(entityName, itemID)) { return }

    const entities = this.normalizedData.entities
    let entityToBuild = entities[entityName]
    if (!entityToBuild) {
      entities[entityName] = {}
      entityToBuild = entities[entityName]
    }

    entityToBuild[itemID] = {}
    const itemToBuild = entityToBuild[itemID]

    this.buildEntityItem(data, entity, itemToBuild)
  }

  buildEntityItem (data, entity, itemToBuild) {
    const entityParams = this.getEntityParams(entity)

    for (let key in data) {
      const dataItem = data[key]
      const isEntity = this.isEntity(key, entityParams)

      if (isEntity) {
        const entityItem = entityParams[key]
        this.handleEntityKey(itemToBuild, key, entityItem, dataItem)
      } else {
        itemToBuild[key] = this.deepCopy(dataItem)
      }
    }
  }

  handleEntityKey (itemToBuild, key, entityItem, dataItem) {
    if (entityItem instanceof SchemaEntity || entityItem instanceof Array) {
      itemToBuild[key] = this.getIDFromData(dataItem, entityItem)
      this.buildEntitiesForm(dataItem, entityItem)
    } else {
      itemToBuild[key] = {}
      this.buildEntityItem(dataItem, entityItem, itemToBuild[key])
    }
  }
}
