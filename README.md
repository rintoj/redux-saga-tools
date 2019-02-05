
# Redux Saga Tools

Redux Saga Tools is a collection of utility functions to accelerate the development of a redux-saga application, by providing abstractions over most common redux tasks and patterns. This library is build on top of [redux-saga](https://redux-saga.js.org/) - a library that aims to make application side effects easier to manage, more efficient to execute, simple to test, and better at handling failures.

This library is fully compatible with TypeScript.

# Install

```bash
npm install redux-saga-tools
```

# API

## 1. Saga

### `createSaga(action: string, api: Function, successAction?: string, failureAction?: string)`

Creates a saga that will automatically generates `_SUCCESS` and `_ERROR` as the default success and failure actions, if `successAction` and `failureActions` are not provided. This function is best suited for request-response type of interaction with an external API.

```ts
import { createSaga } from 'redux-saga-tools'
import { UserActionType } from './user-actions'

export default [
  createSaga(
    UserActionType.SIGN_IN_USER,
    userApi.signIn
  )
]
// will emit SIGN_IN_USER_SUCCESS or SIGN_IN_USER_ERROR
```

or

```ts
import { createSaga } from 'redux-saga-tools'
import { UserActionType } from './user-actions'

export default [
  createSaga(
    UserActionType.SIGN_IN_USER,
    userApi.signIn,
    UserActionType.SIGN_IN_COMPLETED,  // provide custom success action
    UserActionType.SIGN_IN_FAILED,     // provide custom error action
  )
]
```

API function will receive two parameters: 

- `action`: Payload portion of the action (eg: `{ type: 'SIGN_IN_USER', payload: {email: 'test@mail.com' }}` - action will be `{ email: 'test@mail.com'}` } )

- `state` - Current redux state

```js
export function signIn(action: { email: string }, state: ReduxState) {
  // your api code
}
```

### `createSagaForEvery(action: string, api: Function, successAction?: string, failureAction?: string)`

This works just like `createSaga`, but uses `takeEvery` in place of `takeLatest`. This function is best suited for handling simultaneous actions without cancelling the previous one.

```ts
import { createSagaForEvery } from 'redux-saga-tools'
import { UserActionType } from './user-actions'

export default [
  createSagaForEvery(
    UserActionType.SIGN_IN_USER,
    userApi.signIn,
  )
]

// will emit SIGN_IN_USER_SUCCESS or SIGN_IN_USER_ERROR
```

### `createSagaStream(api: Function, sagaOrAction: Function | string)`

You can open a channel to work with stream of data from the API. For example, the below snippet will emit `ON_CURRENT_USER_CHANGE` action whenever `onAuthChange` emits a value through `callback`.

```ts
import { createSaga } from 'redux-saga-tools'
import { UserActionType } from './user-actions'

export default [
  createSagaStream(
    onAuthChange,
    UserActionType.ON_CURRENT_USER_CHANGE
  )
]

function onAuthChange (callback, action) {
  return asyncAction((data) => callback(data))
}
```

### `createSagaChannel(startAndEndActions: string | string[], callback: Function, sagaOrAction: Function | string): Function`

This works similar to `createSagaStream`, but opens a channel on an action and closes the channel on another action. End action is optional. For every repeated start action, the channel will be closed and reopened, thus keeping one active channel always.

```ts
import { createSagaChannel } from 'redux-saga-tools'
import { UserActionType } from './user-actions'
import { TodoActionType } from './todo-actions'

export default [
  createSagaChannel(
    [UserActionType.SIGN_IN_USER_SUCCESS, UserActionType.SIGN_OUT_USER_SUCCESS]
    watchTodoByUser,
    TodoActionType.ON_CHANGE_TODO_BY_USER
  )
]

function watchUserTodoByUser(callback: Function, { user }: { user: User }) {

  const subscription =  asyncAction(user, (data) => callback(data))

  return function unsubscribe() {
    subscription.cancel()
  }
}
```

Your handler must return a function, that will be invoked just before the channel is closed. Therefore the returned function can be used to close any open subscriptions or API resources.

### Start Saga

Putting it all together.

```js
import { all } from 'redux-saga/effects'
import { reducers } from './reducers'
import { userSagas } from './user/user-saga'
import { todoSagas } from './todo/todo-saga'

export function* sagas(): any {
  yield all([
    ...userSagas,
    ...todoSagas,
  ])
}

// configure middleware
const sagaMiddleware = createSagaMiddleware()
const middleware = applyMiddleware(sagaMiddleware)

// create store
export const store = createStore(reducers, config.initialState, middleware)

// run saga
sagaMiddleware.run(sagas as any)
```

## 2. Action

Create actions using `ActionsUnion`, `ById` and `createAction` utilities to make actions fully compatible with TypeScript, and thereby code with strongly typed actions and types.

```js
import { ActionsUnion, ById, createAction } from 'redux-saga-tools'
import { User } from './user'

export enum UserActionType {
  FETCH_BY_ID = '@User/FETCH_BY_ID',
  FETCH_BY_ID_SUCCESS = '@User/FETCH_BY_ID_SUCCESS',

  ON_CURRENT_USER_CHANGE = '@User/ON_CURRENT_USER_CHANGE',

  SIGN_IN = '@User/SIGN_IN',
  SIGN_IN_SUCCESS = '@User/SIGN_IN_SUCCESS',

  SIGN_OUT = '@User/SIGN_OUT',
  SIGN_OUT_SUCCESS = '@User/SIGN_OUT_SUCCESS',
}

export const UserActions = {
  fetchById: (id: string) => createAction(UserActionType.FETCH_BY_ID, { id }),

  signIn: (email: string) => createAction(UserActionType.SIGN_IN, { email }),
  signOut: () => createAction(UserActionType.SIGN_OUT),
}

export type UserActions = ActionsUnion<typeof UserActions>
```

Dispatch an action:

```js
dispatch(UserActions.fetchById('id'))
```

## 3. Reducer

This section contains utility functions that will accelerate the development of reducer functions.

### `createReducer(initialState: any, handlers: any)`

Switch statements are generally used for writing reducer functions. `createReducer` will allow you to attach an action with a reducer through an object map instead. This will help you write every reducer as a functional unit with its own variables and parameters, making it easy to test and maintain.

```ts
// user-reducer.js

import { createReducer } from 'redux-saga-tools'

function onUserSignIn(state: UserState, action: { user: User}): UserState {
  return { ...state, currentUser: action.user }
}

function onUserSignOut(state: UserState): UserState {
  return { ...state, currentUser: undefined }
}

export default createReducer({}, {
  [UserActionType.SIGN_IN_USER_SUCCESS]: onUserSignIn,
  [UserActionType.SIGN_OUT_USER_SUCCESS]: onUserSignOut,
})
```

Use `combineReducers` to create root reducer.

```js
// reducers.js

import { combineReducers } from 'redux'
import { progressReducer } from 'redux-saga-tools'
import todoReducer from './todo/todo-reducer'
import userReducer from './user/user-reducer'

export const reducers = combineReducers({
  user: userReducer,
  todo: todoReducer,
  progress: progressReducer,
})
```

#### Progress Reducer

Please note the special reducer `progressReducer`. We will discuss about this [later in this article](#handling-action-progress).

### `reduceById(array: T[]): ById<T>`

Reduces an array of object with property `id` to an object with keys as `id`

```js
const users = [
  {id: 'a', name: 'John'  }
  {id: 'b', name: 'Jack'  }
]
const usersById = reduceById(users)  

// will return  
// {
//   a:  {id: 'a', name: 'John'  },
//   b:  {id: 'b', name: 'Jack'  }
// }
```

### `toArray(byId: ById<T>): T[]`

Converts an object by id into an array (reverse operation of `reduceById`)

```js
const usersById = {
  a:  {id: 'a', name: 'John'  },
  b:  {id: 'b', name: 'Jack'  }
}
const users = toArray(usersById)  

// will return
// [
//   {id: 'a', name: 'John'  }
//   {id: 'b', name: 'Jack'  }
// ]
```

### `setById<T>(state: any, byId: ById<T>): any`

Keeping core objects in state by id is a common practice in redux. This function will do the merge as required.

```js
function reduceStateOnUsersChange(userState: UserState, usersById: ById<User>) {
  return setById(userState, usersById)
}

// will return:
// {
//   ...userState,
//   byId: {
//     ...userState.byId,
//     ...byId
//   }
// }
```

### `filterById(byId: ById<T>, ids: string[]): ById<T>`

This function will return an object with `id` matching one of the values in `ids`.

```js
const usersById = {
  a:  {id: 'a', name: 'John'  },
  b:  {id: 'b', name: 'Jack'  }
}
const users = filterById(usersById, ['b'])  

// will return:
// {
//   b:  {id: 'b', name: 'Jack'  }
// }
```

### `filterToArrayById(byId: ById<T>, ids: string[]): T[]`

This works similar to `filterById`, returns an array of matching items.

```js
const usersById = {
  a:  {id: 'a', name: 'John'  },
  b:  {id: 'b', name: 'Jack'  }
}
const users = filterToArrayById(usersById, ['b'])  

// will return:
// [
//   {id: 'b', name: 'Jack'  }
// ]
```

### `unique(array?: any[])`

This function will return unique items of an array.

```js
const ids = unique(['a', 'b', 'b', 'c']) // ['a', 'b', 'c']
```

### `uniqueProps(array?: any[], property: string = 'id'): any[]`

This function will return unique values of a property from the given array of objects.

```js
const ids = uniqueProps([{ id: 'a' }, { id: 'b' }, { id: 'b' }, { id: 'c' }], 'id') // ['a', 'b', 'c']
```

### `uniquePropsById(byId?: ById<any>, property: string = 'id'): any[]`

Same as `uniqueProps`, but works with an object instead of an array.

```js
const ids = uniquePropsById({
  'a1': { id: 'a' },
  'a2': { id: 'b' },
  'a3': { id: 'b' },
  'a4': { id: 'c' }
}, 'id') // ['a', 'b', 'c']
```

### `missingIds(byId: ById<T>, ids: string[])`

This function will return the list of ids for which the values are missing in `byId`

```js
const ids = missingIds({
  'a1': { id: 'a' },
  'a2': { id: 'b' },
  'a3': { id: 'b' },
  'a4': { id: 'c' }
}, ['a1', 'a5', 'a6']) // ['a5', 'a6']
```

## Handling Action Progress

UI needs to know the progress of the action being carried out by the saga or API to respond gracefully to users. This library is configured with a progress tracking setup.

To track progress of an action, use `selectProgress` by providing current application state as the first parameter and the action you want to track as the second parameter. Remember to add `progressReducer` to the root reducer for this setup to work ([See here](#progress-reducer))

```tsx
import * as React from 'react'
import { didProgressComplete, didProgressFail, Progress, selectProgress } from 'redux-saga-tools'

export interface Props {
  ...
  dispatch?: Dispatch<any>
  todoId?: string
  todoProgress?: Progress
}

export interface State { }

class TodoScreen extends React.Component<Props, State> {

  componentWillReceiveProps(props: Props) {
    if (didProgressComplete(props.todoProgress, this.props.todoProgress)) {
      // take next action in UI
    } else if (didProgressFail(props.todoProgress, this.props.todoProgress)) {
      // show an error
    }
  }

  fetch() {
    const { dispatch, todoId } = this.props
    dispatch && dispatch(TodoActions.fetchTodo(todoId))
  }

  render() {
    return <div>
      {todoProgress && todoProgress.inProgress && <div>Loading...</div>}
      ...
    </div>
  }
}

function mapStateToProps(state: AppState): Props {
  return {
    ...
    todoProgress: selectProgress(state, TodoActionType.FETCH_TODO_BY_ID),
  }
}

export default connect(mapStateToProps)(TodoScreen)
```

## About

### Hope this library is helpful to you. Please make sure to checkout my other [projects](https://github.com/rintoj) and [articles](https://medium.com/@rintoj). Enjoy coding!

## Contributing

Contributions are welcome! Just send a pull request. Feel free to contact [me](mailto:rintoj@gmail.com) or checkout my [GitHub](https://github.com/rintoj) page.

## Author

**Rinto Jose** (rintoj)

Follow me:
  [GitHub](https://github.com/rintoj)
| [Facebook](https://www.facebook.com/rinto.jose)
| [Twitter](https://twitter.com/rintoj)
| [Youtube](https://youtube.com/+RintoJoseMankudy)

## License

```code
The MIT License (MIT)

Copyright (c) 2019 Rinto Jose (rintoj)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```