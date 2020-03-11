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
      const entityName = entityItem.name
      const denormalizedItem = this.getDenormalizedItem(entityName, dataItem)
      if (denormalizedItem) {
        result[key] = denormalizedItem
        return
      }
      result[key] = {}
      this.buildDenormalizedFrom(entityName, dataItem, result[key])
      this.buildDenormalizedData(entityItem, dataItem, result[key])
    } else if (entityItem instanceof Array) {
      result[key] = []
      this.handleDenormalizedArray(entityItem[0], dataItem, result[key])
    } else {
      result[key] = {}
      this.buildDataItem(entityItem, dataItem, result[key])
    }
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
        this.buildDenormalizedData(entity, id, itemResult)
        result.push(itemResult)
      }
    })
  }

  getDenormalizedItem (entityName, id) {
    const isDenormalized = this.isDataAlreadyDenormalized(entityName, id)
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

  isDataAlreadyDenormalized (entityName, id) { // 这个看看怎么抽象，重复了
    const entities = this.denormalizedFrom
    const entity = entities[entityName]

    if (!entity) return false

    const item = entity[id]

    if (!item) return false

    return true
  }
}
