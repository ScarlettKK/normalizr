export default class SchemaEntity {
  constructor (name, entityParams = {}, entityConfig = {}) {
    this.name = name
    this.entityParams = this.copyEntityParams(entityParams)
    this.entityConfig = entityConfig.idAttribute ? entityConfig.idAttribute : 'id'
  }

  define (entityParams) {
    this.entityParams = this.copyEntityParams(entityParams)
  }

  copyEntityParams (entityParams) {
    const copyResult = {}

    for (let entity in entityParams) {
      if (entityParams.hasOwnProperty(entity)) {
        copyResult[entity] = entityParams[entity]
      }
    }

    return copyResult
  }
}
