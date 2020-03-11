import Structure from './Structure'
import SchemaEntity from '../schema/SchemaEntity'

export default class Denormalize extends Structure {
  constructor (denormalizeDataId, entity, data) {
    super(data, entity)
    this.denormalizeDataId = denormalizeDataId
    this.denormalizedFrom = {}
  }

  denormalizeProcessing () {
    const dataId = this.denormalizeDataId
    const entity = this.entity

    this.denormalizedData = this.initDenormalizedResult(dataId)

    this.buildDenormalizedData(entity, dataId, this.denormalizedData)

    return this.denormalizedData
  }

  initDenormalizedResult (dataId) {
    if (dataId instanceof Array) { return [] } else { return {} }
  }

  buildDenormalizedData (entity, dataId, result) {
    if (dataId instanceof Array) {
      const currentEntity = entity[0]
      dataId.forEach((id, index) => {
        result[index] = {}
        this.getDataItem(currentEntity, id, result[index])
      })
    } else {
      this.getDataItem(entity, dataId, result)
    }
  }

  getDataItem (entity, dataId, result) {
    const entityName = entity.name
    const dataEntity = this.data[entityName]
    const dataItem = dataEntity[dataId] // 可能会没有这一项数据

    this.buildDataItem(entity, dataItem, result)
  }

  buildDataItem (entity, data, result) {
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
      result[key] = {}
      const entityName = entityItem.name
      this.buildDenormalizedFrom(entityName, dataItem, result[key])
      this.buildDenormalizedData(entityItem, dataItem, result[key])
    } else if (entityItem instanceof Array) {
      result[key] = []
      this.buildDenormalizedData(entityItem, dataItem, result[key])
    } else {
      result[key] = {}
      this.buildDataItem(entityItem, dataItem, result[key])
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

  isDataAlreadyDenormalized (entityName, id) { // 这个看看怎么抽象，重复了
    const entities = this.denormalizedFrom
    const entity = entities[entityName]

    if (!entity) return false

    const item = entity[id]

    if (!item) return false

    return true
  }
}
