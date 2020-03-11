import schema from './schema'
import { Normalize, Denormalize } from './structure'

function normalize (data, entity) {
  var result = new Normalize(data, entity)

  return result.normalizeProcessing()
}

function denormalize (denormalizeDataId, entity, data) {
  var result = new Denormalize(denormalizeDataId, entity, data)

  return result.denormalizeProcessing()
}

export { schema, normalize, denormalize }
