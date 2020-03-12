import Structure from './Structure'
import SchemaEntity from '../schema/SchemaEntity'

export default class Denormalize extends Structure {
  constructor (denormalizeDataId, entity, data) {
    super(data, entity)
    this.denormalizeDataId = denormalizeDataId
    this.denormalizedFrom = new WeakMap()
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
    const dataItem = this.getNormalizedDataItem(entityName, dataID)
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
    const index = this.getNormalizedDataItem(entityName, dataItem)
    const denormalizedItem = this.getDenormalizedItem(index)
    if (denormalizedItem) {
      result[key] = denormalizedItem
      return
    }
    result[key] = {}
    this.buildDenormalizedFrom(index, result[key])
    this.currentEntity = entityItem
    this.currentDataID = dataItem
    this.buildDenormalizedData(result[key])
  }

  handleDenormalizedArray (result) {
    const entity = this.currentEntity[0]
    const ids = this.currentData
    const entityName = entity.name
    ids.forEach((id) => {
      const index = this.getNormalizedDataItem(entityName, id)
      const denormalizedItem = this.getDenormalizedItem(index)
      if (denormalizedItem) {
        result.push(denormalizedItem)
      } else {
        const itemResult = {}
        this.buildDenormalizedFrom(index, itemResult)
        this.currentEntity = entity
        this.currentDataID = id
        this.buildDenormalizedData(itemResult)
        result.push(itemResult)
      }
    })
  }

  getNormalizedDataItem (entityName, id) {
    const dataEntity = this.data[entityName]
    return dataEntity[id]
  }

  getDenormalizedItem (index) {
    return this.denormalizedFrom.get(index)
  }

  buildDenormalizedFrom (index, entityPointer) {
    this.denormalizedFrom.set(index, entityPointer)
  }
}
