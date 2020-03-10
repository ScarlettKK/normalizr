export default class Structure {
  constructor (data, entity) {
    this.data = this.deepCopy(data)
    this.entity = entity.copyEntityParams(entity.entityParams) // 是不是一个规范的做法？
  }

  deepCopy (data) {
    let copyResult

    if (typeof data !== 'object') {
      return data
    } else {
      copyResult = new data.constructor()
      for (let key in data) {
        copyResult[key] = this.deepCopy(data[key])
      }
    }

    return copyResult
  }

  isEntity (key) {
    for (let e in this.entity) {
      if (e === key) return true
    }

    return false
  }
}
