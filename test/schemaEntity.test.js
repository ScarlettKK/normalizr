import { schema } from '../src'

// the test of SchemaEntity constructor
test('constructor test with all param correct', () => {
  const user = new schema.Entity('users', {}, {
    idAttribute: 'uid'
  })
  expect(user.name).toBe('users')
  expect(user.foreignKeys).toEqual({})
  expect(user.key).toBe('uid')
})

test('constructor test with "" name param', () => {
  expect(() => new schema.Entity('', {}, {})).toThrow(
    'invalid name type'
  )
})

test('constructor test with null entityParams param', () => {
  expect(() => new schema.Entity('user', null, {})).toThrow(
    'invalid foreign key type'
  )
})

test('constructor test with null entityConfig param', () => {
  expect(() => new schema.Entity('users', {}, null)).toThrow(
    'invalid main key type'
  )
})

test('constructor test with wrong name type', () => {
  expect(() => new schema.Entity({ name: '123' }, {}, {})).toThrow(
    'invalid name type'
  )
})

test('constructor test with wrong entityParams type', () => {
  expect(() => new schema.Entity('user', 'foreignKey', {})).toThrow(
    'invalid foreign key type'
  )
})

test('constructor test with wrong entityConfig type', () => {
  const user = new schema.Entity('users', {}, '123')
  expect(user.getKeyValue({ id: '123' })).toBe('123')
})

test('constructor test of a not SchemaEntity type in entityParams', () => {
  expect(() => new schema.Entity('user', { foreignKeys: 'haha' }, {})).toThrow(
    'invalid foreign key type'
  )
})

test('constructor test with no idAttribute in entityConfig', () => {
  const user = new schema.Entity('users', {}, { test: 'haha' })
  expect(user.getKeyValue({ id: '123' })).toBe('123')
})

// the test of getKeyValue
test('basic function of getKeyValue', () => {
  const user = new schema.Entity('users', {}, {
    idAttribute: 'uid'
  })
  expect(user.getKeyValue({ uid: '123' })).toBe('123')
})

test('getKeyValue with wrong param type', () => {
  const user = new schema.Entity('users', {}, {
    idAttribute: 'uid'
  })
  expect(() => user.getKeyValue('123')).toThrow(
    'can\'t find the main key of data'
  )
})

test('getKeyValue of param with no keyvalue', () => {
  const user = new schema.Entity('users', {}, {
    idAttribute: 'uid'
  })
  expect(() => user.getKeyValue({ name: 'David' })).toThrow(
    'can\'t find the main key of data'
  )
})

test('getKeyValue with no param', () => {
  const user = new schema.Entity('users', {}, {
    idAttribute: 'uid'
  })
  expect(() => user.getKeyValue()).toThrow(
    'can\'t find the main key of null data'
  )
})

// the test of define
test('the basic function of define', () => {
  const circleUser = new schema.Entity('circleUser')
  circleUser.define({
    friends: [circleUser]
  })
  expect(circleUser.ifCircle).toBe(true)
})

test('define of foreignKey with no circle', () => {
  const user = new schema.Entity('users', {}, {
    idAttribute: 'uid'
  })
  const comment = new schema.Entity('comments')
  comment.define({
    commenter: user
  })
  expect(comment.ifCircle).toBe(false)
})

test('define with wrong param type', () => {
  const circleUser = new schema.Entity('circleUser')
  expect(() => circleUser.define('123')).toThrow(
    'invalid foreign key type'
  )
})

test('define of a not SchemaEntity type in circleForeignKey', () => {
  const circleUser = new schema.Entity('circleUser')
  expect(() => circleUser.define({
    friends: '123'
  })).toThrow(
    'invalid foreign key type'
  )
})

test('define with no param', () => {
  const circleUser = new schema.Entity('circleUser')
  expect(() => circleUser.define()).toThrow(
    'invalid foreign key type'
  )
})

// the test of checkCircle
test('the basic function of checkCircle', () => {
  const circleUser = new schema.Entity('circleUser')
  expect(circleUser.checkCircle({
    friends: [circleUser]
  })).toBe(true)
})

test('checkCircle of foreignKey with no circle', () => {
  const user = new schema.Entity('users', {}, {
    idAttribute: 'uid'
  })
  const comment = new schema.Entity('comments')
  expect(comment.checkCircle({
    commenter: user
  })).toBe(false)
})

test('checkCircle with wrong param type', () => {
  const circleUser = new schema.Entity('circleUser')
  expect(() => circleUser.checkCircle('123')).toThrow(
    'invalid foreign key type'
  )
})

test('checkCircle of a not SchemaEntity type in foreignKey', () => {
  const circleUser = new schema.Entity('circleUser')
  expect(() => circleUser.checkCircle({
    friends: '123'
  })).toThrow(
    'invalid foreign key type'
  )
})

test('checkCircle with no param', () => {
  const circleUser = new schema.Entity('circleUser')
  expect(() => circleUser.checkCircle()).toThrow(
    'invalid foreign key type'
  )
})

// the test of addCirclePointer
test('the basic function of addCirclePointer', () => {
  const circleUser = new schema.Entity('circleUser')
  circleUser.define({
    friends: [circleUser]
  })
  circleUser.addCirclePointer('123', circleUser)
  expect(circleUser.getCirclePointer('123')).toEqual(circleUser)
})

test('addCirclePointer with no id param', () => {
  const circleUser = new schema.Entity('circleUser')
  circleUser.define({
    friends: [circleUser]
  })
  expect(() => circleUser.addCirclePointer(circleUser)).toThrow(
    'worng ID type'
  )
})

test('addCirclePointer with no pointer param', () => {
  const circleUser = new schema.Entity('circleUser')
  circleUser.define({
    friends: [circleUser]
  })
  expect(() => circleUser.addCirclePointer('123')).toThrow(
    'worng pointer type'
  )
})

test('addCirclePointer with wrong id param', () => {
  const circleUser = new schema.Entity('circleUser')
  circleUser.define({
    friends: [circleUser]
  })
  expect(() => circleUser.addCirclePointer(null, circleUser)).toThrow(
    'worng ID type'
  )
})

test('addCirclePointer with wrong pointer param', () => {
  const circleUser = new schema.Entity('circleUser')
  circleUser.define({
    friends: [circleUser]
  })
  expect(() => circleUser.addCirclePointer('123', '123')).toThrow(
    'worng pointer type'
  )
})

test('addCirclePointer of not circle entity', () => {
  const user = new schema.Entity('user')
  expect(() => user.addCirclePointer('123', user)).toThrow(
    'can\'t set CirclePointer of not circle entity'
  )
})

// the test of ifCirclePointerExsited
test('the basic function of ifCirclePointerExsited', () => {
  const circleUser = new schema.Entity('circleUser')
  circleUser.define({
    friends: [circleUser]
  })
  circleUser.addCirclePointer('123', circleUser)
  expect(circleUser.ifCirclePointerExsited('123')).toBe(true)
})

test('ifCirclePointerExsited with no id param', () => {
  const circleUser = new schema.Entity('circleUser')
  circleUser.define({
    friends: [circleUser]
  })
  circleUser.addCirclePointer(123, circleUser)
  expect(() => circleUser.ifCirclePointerExsited()).toThrow(
    'worng ID type'
  )
})

test('ifCirclePointerExsited with wrong id param', () => {
  const circleUser = new schema.Entity('circleUser')
  circleUser.define({
    friends: [circleUser]
  })
  circleUser.addCirclePointer('123', circleUser)
  expect(() => circleUser.ifCirclePointerExsited({ id: 123 })).toThrow(
    'worng ID type'
  )
})

test('ifCirclePointerExsited of not circle entity', () => {
  const user = new schema.Entity('user')
  expect(() => user.ifCirclePointerExsited('123')).toThrow(
    'can\'t get CirclePointer of not circle entity'
  )
})

// the test of getCirclePointer
test('the basic function of getCirclePointer', () => {
  const circleUser = new schema.Entity('circleUser')
  circleUser.define({
    friends: [circleUser]
  })
  circleUser.addCirclePointer('123', circleUser)
  expect(circleUser.getCirclePointer('123')).toEqual(circleUser)
})

test('getCirclePointer with no id param', () => {
  const circleUser = new schema.Entity('circleUser')
  circleUser.define({
    friends: [circleUser]
  })
  circleUser.addCirclePointer('123', circleUser)
  expect(() => circleUser.getCirclePointer()).toThrow(
    'worng ID type'
  )
})

test('getCirclePointer with wrong id param', () => {
  const circleUser = new schema.Entity('circleUser')
  circleUser.define({
    friends: [circleUser]
  })
  circleUser.addCirclePointer('123', circleUser)
  expect(() => circleUser.getCirclePointer({ id: 123 })).toThrow(
    'worng ID type'
  )
})

test('getCirclePointer of not circle entity', () => {
  const user = new schema.Entity('user')
  expect(() => user.getCirclePointer('123')).toThrow(
    'can\'t get CirclePointer of not circle entity'
  )
})

// test of build entity with obj deep copy
test('constructor with entityParams param deep copy', () => {
  const user = new schema.Entity('users', {}, {
    idAttribute: 'uid'
  })
  const a = {
    commenter: user
  }
  const comment = new schema.Entity('comments', a)
  a.commenter = '123'

  expect(comment.foreignKeys).not.toEqual(a)
})

test('define with circleForeignKey param deep copy', () => {
  const circleUser = new schema.Entity('circleUser')
  const a = {
    friends: [circleUser]
  }
  circleUser.define(a)
  a.friends = '123'

  expect(circleUser.foreignKeys).not.toEqual(a)
})
