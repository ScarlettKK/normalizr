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
    const dataId = this.denormalizeDataId
    const entity = this.entity
    this.currentEntity = entity

    this.denormalizedData = this.initDenormalizedData(dataId)
    this.buildDenormalizedData(dataId, this.denormalizedData)

    return this.denormalizedData
  }

  initDenormalizedData (dataId) {
    if (dataId instanceof Array) { return [] } else { return {} }
  }

  buildDenormalizedData (dataId, result) {
    const entity = this.currentEntity

    if (dataId instanceof Array) {
      this.currentEntity = entity[0]
      dataId.forEach((id, index) => {
        result[index] = {}
        this.buildDataItem(id, result[index])
      })
    } else {
      this.buildDataItem(dataId, result)
    }
  }

  buildDataItem (dataId, result) {
    const entity = this.currentEntity
    const entityName = entity.name
    const dataEntity = this.data[entityName]
    const dataItem = dataEntity[dataId] // 可能会没有这一项数据

    this.buildDataItemKeys(entity, dataItem, result)
  }

  buildDataItemKeys (entity, data, result) {
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
    if (entityItem instanceof SchemaEntity) {
      this.handleDenormalizedEntity(entityItem, dataItem, key, result)
    } else if (entityItem instanceof Array) {
      result[key] = []
      this.handleDenormalizedArray(entityItem[0], dataItem, result[key])
    } else {
      result[key] = {}
      this.buildDataItemKeys(entityItem, dataItem, result[key])
    }
  }

  handleDenormalizedEntity (entityItem, dataItem, key, result) { // 参数顺序 参数个数
    const entityName = entityItem.name
    const denormalizedItem = this.getDenormalizedItem(entityName, dataItem)
    if (denormalizedItem) {
      result[key] = denormalizedItem
      return
    }
    result[key] = {}
    this.buildDenormalizedFrom(entityName, dataItem, result[key])
    this.currentEntity = entityItem
    this.buildDenormalizedData(dataItem, result[key])
  }

  handleDenormalizedArray (entity, ids, result) {
    const entityName = entity.name
    ids.forEach((id) => {
      const denormalizedItem = this.getDenormalizedItem(entityName, id)
      if (denormalizedItem) {
        result.push(denormalizedItem)
      } else {
        const itemResult = {}
        this.buildDenormalizedFrom(entityName, id, itemResult)
        this.currentEntity = entity
        this.buildDenormalizedData(id, itemResult)
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
