import { normalize, schema } from '../../src'

test('normalized Data basic function test', () => {
  // Define a users schema
  const user = new schema.Entity('users', {}, {
    idAttribute: 'uid'
  })

  // Define your comments schema
  const comment = new schema.Entity('comments', {
    commenter: user
  })

  // Define your article
  const article = new schema.Entity('articles', {
    author: user,
    comments: {
      result: [ comment ]
    }
  })

  const originalData = {
    'id': '123',
    'author': {
      'uid': '1',
      'name': 'Paul'
    },
    'title': 'My awesome blog post',
    'comments': {
      total: 100,
      result: [{
        'id': '324',
        'commenter': {
          'uid': '2',
          'name': 'Nicole'
        }
      }]
    }
  }
  expect(normalize(originalData, article)).toEqual(
    {
      result: '123',
      entities: {
        'articles': {
          '123': {
            id: '123',
            author: '1',
            title: 'My awesome blog post',
            comments: {
              total: 100,
              result: [ '324' ]
            }
          }
        },
        'users': {
          '1': { 'uid': '1', 'name': 'Paul' },
          '2': { 'uid': '2', 'name': 'Nicole' }
        },
        'comments': {
          '324': { id: '324', 'commenter': '2' }
        }
      }
    }
  )
})

test('normalized Data test with array', () => {
  // Define a users schema
  const user = new schema.Entity('users', {}, {
    idAttribute: 'uid'
  })

  // Define your comments schema
  const comment = new schema.Entity('comments', {
    commenter: user
  })

  // Define your article
  const article = new schema.Entity('articles', {
    author: user,
    comments: {
      result: [ comment ]
    }
  })

  const originalDataMoreComments = {
    'id': '123',
    'author': {
      'uid': '1',
      'name': 'Paul'
    },
    'title': 'My awesome blog post',
    'comments': {
      total: 100,
      result: [{
        'id': '324',
        'commenter': {
          'uid': '2',
          'name': 'Nicole'
        }
      }, {
        'id': '322',
        'commenter': {
          'uid': '4',
          'name': 'Apple'
        }
      }]
    }
  }
  expect(normalize(originalDataMoreComments, article)).toEqual(
    {
      result: '123',
      entities: {
        'articles': {
          '123': {
            id: '123',
            author: '1',
            title: 'My awesome blog post',
            comments: {
              total: 100,
              result: [ '324', '322' ]
            }
          }
        },
        'users': {
          '1': { 'uid': '1', 'name': 'Paul' },
          '2': { 'uid': '2', 'name': 'Nicole' },
          '4': { 'uid': '4', 'name': 'Apple' }
        },
        'comments': {
          '324': { id: '324', 'commenter': '2' },
          '322': { id: '322', 'commenter': '4' }
        }
      }
    }
  )
})

test('normalized Data test with cicular', () => {
  const circleUser = new schema.Entity('circleUser')

  circleUser.define({
    friends: [circleUser]
  })

  const circleUserData = {
    'friends': [],
    'id': 123
  }

  circleUserData.friends.push(circleUserData)

  const implicitCircleUser123 = {
    'friends': [],
    'id': 123
  }

  const implicitCircleUser456 = {
    'friends': [implicitCircleUser123],
    'id': 456
  }

  implicitCircleUser123.friends.push(implicitCircleUser456)

  const expectCircleData = {
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

  const expectImplicitCircleData = {
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

  expect(normalize(circleUserData, circleUser)).toEqual(expectCircleData)
  expect(normalize(implicitCircleUser123, circleUser)).toEqual(expectImplicitCircleData)
})

// describe('normalize', () => {
//   [42, null, undefined, '42', () => {}].forEach((input) => {
//     test(`cannot normalize input that == ${input}`, () => {
//       expect(() => normalize(input, new schema.Entity('test'))).toThrow()
//     })
//   })

//   test('cannot normalize without a schema', () => {
//     expect(() => normalize({})).toThrow()
//   })

//   test('cannot normalize with null input', () => {
//     const mySchema = new schema.Entity('tacos')
//     expect(() => normalize(null, mySchema)).toThrow(/null/)
//   })

//   test('normalizes entities', () => {
//     const mySchema = new schema.Entity('tacos')

//     expect(normalize([{ id: 1, type: 'foo' }, { id: 2, type: 'bar' }], [mySchema])).toMatchSnapshot()
//   })

//   test('normalizes entities with circular references', () => {
//     const user = new schema.Entity('users')
//     user.define({
//       friends: [user]
//     })

//     const input = { id: 123, friends: [] }
//     input.friends.push(input)

//     expect(normalize(input, user)).toMatchSnapshot()
//   })

//   test('normalizes nested entities', () => {
//     const user = new schema.Entity('users')
//     const comment = new schema.Entity('comments', {
//       user: user
//     })
//     const article = new schema.Entity('articles', {
//       author: user,
//       comments: [comment]
//     })

//     const input = {
//       id: '123',
//       title: 'A Great Article',
//       author: {
//         id: '8472',
//         name: 'Paul'
//       },
//       body: 'This article is great.',
//       comments: [
//         {
//           id: 'comment-123-4738',
//           comment: 'I like it!',
//           user: {
//             id: '10293',
//             name: 'Jane'
//           }
//         }
//       ]
//     }
//     expect(normalize(input, article)).toMatchSnapshot()
//   })

//   test('does not modify the original input', () => {
//     const user = new schema.Entity('users')
//     const article = new schema.Entity('articles', { author: user })
//     const input = Object.freeze({
//       id: '123',
//       title: 'A Great Article',
//       author: Object.freeze({
//         id: '8472',
//         name: 'Paul'
//       })
//     })
//     expect(() => normalize(input, article)).not.toThrow()
//   })

//   test('ignores null values', () => {
//     const myEntity = new schema.Entity('myentities')
//     expect(normalize([null], [myEntity])).toMatchSnapshot()
//     expect(normalize([undefined], [myEntity])).toMatchSnapshot()
//     expect(normalize([false], [myEntity])).toMatchSnapshot()
//   })

//   // test('uses the non-normalized input when getting the ID for an entity', () => {
//   //   const userEntity = new schema.Entity('users')
//   //   const idAttributeFn = jest.fn((nonNormalized, parent, key) => nonNormalized.user.id)
//   //   const recommendation = new schema.Entity(
//   //     'recommendations',
//   //     { user: userEntity },
//   //     {
//   //       idAttribute: idAttributeFn
//   //     }
//   //   )

//   //   expect(normalize({ user: { id: '456' } }, recommendation)).toMatchSnapshot()
//   //   expect(idAttributeFn.mock.calls).toMatchSnapshot()
//   //   expect(recommendation.idAttribute).toBe(idAttributeFn)
//   // })

//   // test('passes over pre-normalized values', () => {
//   //   const userEntity = new schema.Entity('users')
//   //   const articleEntity = new schema.Entity('articles', { author: userEntity })

//   //   expect(normalize({ id: '123', title: 'normalizr is great!', author: 1 }, articleEntity)).toMatchSnapshot()
//   // })

//   test('can normalize object without proper object prototype inheritance', () => {
//     const test = { id: 1, elements: [] }
//     test.elements.push(
//       Object.assign(Object.create(null), {
//         id: 18,
//         name: 'test'
//       })
//     )

//     const testEntity = new schema.Entity('test', {
//       elements: [new schema.Entity('elements')]
//     })

//     expect(() => normalize(test, testEntity)).not.toThrow()
//   })

//   // test('can normalize entity nested inside entity using property from parent', () => {
//   //   const linkablesSchema = new schema.Entity('linkables')
//   //   const mediaSchema = new schema.Entity('media')
//   //   const listsSchema = new schema.Entity('lists')

//   //   const schemaMap = {
//   //     media: mediaSchema,
//   //     lists: listsSchema
//   //   }

//   //   linkablesSchema.define({
//   //     data: (parent) => schemaMap[parent.schema_type]
//   //   })

//   //   const input = {
//   //     id: 1,
//   //     module_type: 'article',
//   //     schema_type: 'media',
//   //     data: {
//   //       id: 2,
//   //       url: 'catimage.jpg'
//   //     }
//   //   }

//   //   expect(normalize(input, linkablesSchema)).toMatchSnapshot()
//   // })

//   test('can normalize entity nested inside object using property from parent', () => {
//     const mediaSchema = new schema.Entity('media')
//     const listsSchema = new schema.Entity('lists')

//     const schemaMap = {
//       media: mediaSchema,
//       lists: listsSchema
//     }

//     const linkablesSchema = {
//       data: (parent) => schemaMap[parent.schema_type]
//     }

//     const input = {
//       id: 1,
//       module_type: 'article',
//       schema_type: 'media',
//       data: {
//         id: 2,
//         url: 'catimage.jpg'
//       }
//     }

//     expect(normalize(input, linkablesSchema)).toMatchSnapshot()
//   })
// })
