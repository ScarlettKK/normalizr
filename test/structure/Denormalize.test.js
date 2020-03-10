import { schema, normalize, denormalize } from '../src'

const page = new schema.Entity('page', {})
const user = new schema.Entity('user', {}, {})
const book = new schema.Entity('book', {
  pages: [ page ],
  author: user
})
const comment = new schema.Entity('comment', {
  commenter: user
})

const mybook = new schema.Entity('mybook', {
  author: user,
  books: [ book ],
  comments: {
    result: [ comment ]
  }
}, { idAttribute: 'customizedId' })

// 对应的originalData, 注意这里原始数据没有包含`books`字段
const mybookOriginalData = {
  customizedId: '666',
  author: { id: '12345', name: 'uname' },
  comments: {
    total: 100,
    result: [{
      id: 'comment1',
      commenter: {
        id: '999',
        name: 'Shopee'
      }
    }, {
      id: 'coment2',
      commenter: {
        id: '999',
        name: 'Shopee'
      }
    }]
  }
}

const normalizedData = normalize(mybookOriginalData, mybook)

test('denormalizedData common test', () => {
  expect(denormalize(['999'], [user], normalizedData.entities)).toEqual(
    [
      {
        id: '999',
        name: 'Shopee'
      }
    ]
  )
})

test('denormalizedData get part info test', () => {
  expect(denormalize('666', mybook, normalizedData.entities)).toEqual(
    {
      customizedId: '666',
      author: { id: '12345', name: 'uname' },
      comments: {
        total: 100,
        result: [{
          id: 'comment1',
          commenter: {
            id: '999',
            name: 'Shopee'
          }
        }, {
          id: 'coment2',
          commenter: {
            id: '999',
            name: 'Shopee'
          }
        }]
      }
    }
  )
})

const circleUser = new schema.Entity('circleUser')

circleUser.define({
  friends: [circleUser]
})

const circleData = {
  entities: {
    circleUser: {
      123: {
        friends: [123],
        id: 123
      }
    }
  },
  result: 123
}

const expectCircleUser = {
  'friends': [],
  'id': 123
}

expectCircleUser.friends.push(expectCircleUser)

test('denormalizedData cicular test', () => {
  expect(denormalize(123, circleUser, circleData.entities)).toEqual(
    expectCircleUser
  )
})

const implicitCircleData = {
  entities: {
    circleUser: {
      123: {
        friends: [456],
        id: 123
      },
      456: {
        friends: [123],
        id: 456
      }
    }
  },
  result: 123
}

const expectImplicitCircleUser123 = {
  'friends': [],
  'id': 123
}

const expectImplicitCircleUser456 = {
  'friends': [expectImplicitCircleUser123],
  'id': 456
}

expectImplicitCircleUser123.friends.push(expectImplicitCircleUser456)

test('denormalizedData implicit cicular test', () => {
  expect(denormalize(123, circleUser, implicitCircleData.entities)).toEqual(
    expectImplicitCircleUser123
  )
})

describe('denormalize', () => {
  test('cannot denormalize without a schema', () => {
    expect(() => denormalize({})).toThrow()
  })

  test('returns the input if undefined', () => {
    expect(denormalize(undefined, {}, {})).toBeUndefined()
  })

  test('denormalizes entities', () => {
    const mySchema = new schema.Entity('tacos')
    const entities = {
      tacos: {
        1: { id: 1, type: 'foo' },
        2: { id: 2, type: 'bar' }
      }
    }
    expect(denormalize([1, 2], [mySchema], entities)).toMatchSnapshot()
  })

  test('denormalizes nested entities', () => {
    const user = new schema.Entity('users')
    const comment = new schema.Entity('comments', {
      user: user
    })
    const article = new schema.Entity('articles', {
      author: user,
      comments: [comment]
    })

    const entities = {
      articles: {
        '123': {
          author: '8472',
          body: 'This article is great.',
          comments: ['comment-123-4738'],
          id: '123',
          title: 'A Great Article'
        }
      },
      comments: {
        'comment-123-4738': {
          comment: 'I like it!',
          id: 'comment-123-4738',
          user: '10293'
        }
      },
      users: {
        '10293': {
          id: '10293',
          name: 'Jane'
        },
        '8472': {
          id: '8472',
          name: 'Paul'
        }
      }
    }
    expect(denormalize('123', article, entities)).toMatchSnapshot()
  })

  test('set to undefined if schema key is not in entities', () => {
    const user = new schema.Entity('users')
    const comment = new schema.Entity('comments', {
      user: user
    })
    const article = new schema.Entity('articles', {
      author: user,
      comments: [comment]
    })

    const entities = {
      articles: {
        '123': {
          id: '123',
          author: '8472',
          comments: ['1']
        }
      },
      comments: {
        '1': {
          user: '123'
        }
      }
    }
    expect(denormalize('123', article, entities)).toMatchSnapshot()
  })

  test('does not modify the original entities', () => {
    const user = new schema.Entity('users')
    const article = new schema.Entity('articles', { author: user })
    const entities = Object.freeze({
      articles: Object.freeze({
        '123': Object.freeze({
          id: '123',
          title: 'A Great Article',
          author: '8472'
        })
      }),
      users: Object.freeze({
        '8472': Object.freeze({
          id: '8472',
          name: 'Paul'
        })
      })
    })
    expect(() => denormalize('123', article, entities)).not.toThrow()
  })

  test('denormalizes with function as idAttribute', () => {
    const normalizedData = {
      entities: {
        patrons: {
          '1': { id: '1', guest: null, name: 'Esther' },
          '2': { id: '2', guest: 'guest-2-1', name: 'Tom' }
        },
        guests: { 'guest-2-1': { guest_id: 1 } }
      },
      result: ['1', '2']
    }

    const guestSchema = new schema.Entity(
      'guests',
      {},
      {
        idAttribute: (value, parent, key) => `${key}-${parent.id}-${value.guest_id}`
      }
    )

    const patronsSchema = new schema.Entity('patrons', {
      guest: guestSchema
    })

    expect(denormalize(normalizedData.result, [patronsSchema], normalizedData.entities)).toMatchSnapshot()
  })
})
