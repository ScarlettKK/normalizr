import schema from './schema'
import { Normalize } from './structure'

function normalize (data, entity) {
  var result = new Normalize(data, entity)

  return result.normalizeProcessing()
}

export { schema, normalize }
