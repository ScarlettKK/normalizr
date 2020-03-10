import SchemaEntity from '../schema/SchemaEntity'

export default class Structure {
  constructor (data, entity) {
    this.data = data // 当data有环的时候，深拷贝gg了...
    this.entity = entity // 是不是一个规范的做法？
  }

  deepCopy (data) {
    let copyResult

    copyResult = JSON.parse(JSON.stringify(data))

    return copyResult
  }

  getEntityParams (entity) {
    if (entity instanceof SchemaEntity) { return entity.entityParams } else { return entity }
  }

  isEntity (key, entityParams) {
    for (let e in entityParams) {
      if (e === key) return true
    }

    return false
  }
}
