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
    this.currentEntity = this.entity
    this.currentData = this.data

    normalizedData.result = this.getIDFromData()
    this.buildEntitiesForm()

    return normalizedData
  }

  getIDFromData () {
    const data = this.currentData
    const entity = this.currentEntity

    if (!(data instanceof Array)) return entity.getDataID(data)

    const result = []
    const entityItem = entity[0]

    data.forEach((item) => {
      const itemID = entityItem.getDataID(item)
      result.push(itemID)
    })

    return result
  }

  buildEntitiesForm () {
    const data = this.currentData
    const entity = this.currentEntity

    if (entity instanceof Array) { // 可能会entity与data不同步为[]
      const entityItem = entity[0]
      data.forEach((item) => {
        this.currentData = item
        this.buildEntityFrom(entityItem)
      })
    } else {
      this.buildEntityFrom(entity)
    }
  }

  buildEntityFrom (entity) {
    const data = this.currentData
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

    this.buildEntityItem(entity, itemToBuild)
  }

  buildEntityItem (entity, itemToBuild) {
    const data = this.currentData
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
      this.currentEntity = entityItem
      this.currentData = dataItem

      itemToBuild[key] = this.getIDFromData()
      this.buildEntitiesForm()
    } else {
      itemToBuild[key] = {}
      this.currentData = dataItem
      this.buildEntityItem(entityItem, itemToBuild[key])
    }
  }
}
