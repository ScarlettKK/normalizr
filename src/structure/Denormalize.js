import Structure from './Structure'
import SchemaEntity from '../schema/SchemaEntity'

export default class Denormalize extends Structure {
  constructor (denormalizeDataId, entity, data) {
    super(data, entity)
    this.denormalizeDataId = denormalizeDataId
    this.denormalizedFrom = {}
    this.structuredFrom = this.denormalizedFrom
  }

  denormalizeProcessing () {
    const dataID = this.denormalizeDataId
    const entity = this.entity
    this.currentEntity = entity
    this.currentDataID = dataID

    this.denormalizedData = this.initDenormalizedData()
    this.buildDenormalizedData(this.denormalizedData)

    return this.denormalizedData
  }

  initDenormalizedData () {
    const dataID = this.currentDataID
    if (dataID instanceof Array) { return [] } else { return {} }
  }

  buildDenormalizedData (result) {
    const dataID = this.deepCopy(this.currentDataID)
    const entity = this.currentEntity

    if (dataID instanceof Array) {
      this.currentEntity = entity[0]
      dataID.forEach((id, index) => {
        result[index] = {}
        this.currentDataID = id
        this.buildDataItem(result[index])
      })
    } else {
      this.buildDataItem(result)
    }
  }

  buildDataItem (result) {
    const dataID = this.currentDataID
    const entity = this.currentEntity
    const entityName = entity.name
    const dataEntity = this.data[entityName]
    const dataItem = dataEntity[dataID]
    this.currentData = dataItem

    this.buildDataItemKeys(result)
  }

  buildDataItemKeys (result) {
    const entity = this.currentEntity
    const data = this.currentData
    const entityParams = this.getEntityParams(entity)

    for (let key in data) {
      const dataItem = data[key]
      const isEntity = this.isEntity(key, entityParams)

      if (isEntity) {
        const entityItem = entityParams[key]
        this.currentData = dataItem
        this.currentEntity = entityItem
        this.handleKeyOfEntity(result, key)
      } else {
        result[key] = this.deepCopy(dataItem)
      }
    }
  }

  handleKeyOfEntity (result, key) {
    const entityItem = this.currentEntity

    if (entityItem instanceof SchemaEntity) {
      this.handleDenormalizedEntity(result, key)
    } else if (entityItem instanceof Array) {
      result[key] = []
      this.handleDenormalizedArray(result[key])
    } else {
      result[key] = {}
      this.buildDataItemKeys(result[key])
    }
  }

  handleDenormalizedEntity (result, key) { // 参数顺序 参数个数
    const dataItem = this.currentData
    const entityItem = this.currentEntity
    const entityName = entityItem.name
    const denormalizedItem = this.getDenormalizedItem(entityName, dataItem)
    if (denormalizedItem) {
      result[key] = denormalizedItem
      return
    }
    result[key] = {}
    this.buildDenormalizedFrom(entityName, dataItem, result[key])
    this.currentEntity = entityItem
    this.currentDataID = dataItem
    this.buildDenormalizedData(result[key])
  }

  handleDenormalizedArray (result) {
    const entity = this.currentEntity[0]
    const ids = this.currentData
    const entityName = entity.name
    ids.forEach((id) => {
      const denormalizedItem = this.getDenormalizedItem(entityName, id)
      if (denormalizedItem) {
        result.push(denormalizedItem)
      } else {
        const itemResult = {}
        this.buildDenormalizedFrom(entityName, id, itemResult)
        this.currentEntity = entity
        this.currentDataID = id
        this.buildDenormalizedData(itemResult)
        result.push(itemResult)
      }
    })
  }

  getDenormalizedItem (entityName, id) {
    const isDenormalized = this.isDataItemAlreadyStructured(entityName, id)
    if (isDenormalized) {
      const denormalizedEntity = this.denormalizedFrom[entityName]
      return denormalizedEntity[id]
    }
  }

  buildDenormalizedFrom (entityName, id, entityPointer) {
    const entities = this.denormalizedFrom
    let entity = entities[entityName]

    if (!entity) {
      entities[entityName] = {}
      entity = entities[entityName]
    }

    entity[id] = entityPointer
  }
}
