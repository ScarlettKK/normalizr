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
    this.currentEntity = this.entity
    this.currentData = this.data

    normalizedData.result = this.getIDFromData()
    this.buildEntitiesForm()

    return normalizedData
  }

  getIDFromData () {
    const { currentData, currentEntity } = this

    if (!(currentData instanceof Array)) return currentEntity.getDataID(currentData)

    const result = []
    const entityItem = currentEntity[0]

    currentData.forEach((item) => {
      const itemID = entityItem.getDataID(item)
      result.push(itemID)
    })

    return result
  }

  buildEntitiesForm () {
    const { currentData, currentEntity } = this

    if (currentEntity instanceof Array) {
      const entityItem = currentEntity[0]
      currentData.forEach((item) => {
        this.currentData = item
        this.buildEntityFrom(entityItem)
      })
    } else {
      this.buildEntityFrom(currentEntity)
    }
  }

  buildEntityFrom (entity) {
    const data = this.currentData
    const entityName = entity.name
    const itemID = entity.getDataID(data)
    if (this.isDataItemAlreadyNormalized(entityName, itemID)) { return }

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
        this.currentData = dataItem
        this.currentEntity = entityItem
        this.handleEntityKey(itemToBuild, key)
      } else {
        itemToBuild[key] = this.deepCopy(dataItem)
      }
    }
  }

  handleEntityKey (itemToBuild, key) {
    const entityItem = this.currentEntity
    if (entityItem instanceof SchemaEntity || entityItem instanceof Array) {
      itemToBuild[key] = this.getIDFromData()
      this.buildEntitiesForm()
    } else {
      itemToBuild[key] = {}
      this.buildEntityItem(entityItem, itemToBuild[key])
    }
  }

  isDataItemAlreadyNormalized (entityName, id) {
    const entities = this.normalizedData.entities
    const entity = entities[entityName]
    if (!entity) return false

    const item = entity[id]
    if (!item) return false

    return true
  }
}
