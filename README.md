
# Redux Saga Tools

Redux Saga Tools is a collection of utility functions to accelerate the development of a redux-saga application, by providing abstractions over most common redux tasks. This library is build on top of [redux-saga](https://redux-saga.js.org/) - a library that aims to make application side effects easier to manage, more efficient to execute, simple to test, and better at handling failures.

# Install

```bash
npm install redux-saga-tools
```

# API

## 1. Saga

### `createSaga(action: string, api: Function, successAction?: string, failureAction?: string)`

Automatically generates `_SUCCESS` and `_ERROR` as the default success and failure actions, if `successAction` and `failureActions` are not provided

```ts
import { createSaga } from 'redux-saga-tools'

export default [
  createSaga(
    'SIGN_IN_USER',
    userApi.signIn,
    'SIGN_IN_SUCCESS'.
    'SIGN_IN_ERROR',
  )
]
```

### `createSagaForEvery(action: string, api: Function, successAction?: string, failureAction?: string)`

Same as `createSaga`, but instead of using `takeLatest` this function uses `takeEvery`.

```ts
import { createSagaForEvery } from 'redux-saga-tools'

export default [
  createSagaForEvery(
    'SIGN_IN_USER',
    userApi.signIn,
  )
]

// will emit SIGN_IN_USER_SUCCESS or SIGN_IN_USER_ERROR
```

### `createSagaStream(api: Function, sagaOrAction: Function | string)`

Open a channel to work with stream of data from the API. For example, the below snippet will emit `CHANGE_CURRENT_USER` action whenever `onAuthChange` emits a value through `callback`.

```ts
import { createSaga } from 'redux-saga-tools'

export default [
  createSagaStream(
    onAuthChange,
    'CHANGE_CURRENT_USER'
  )
]

function onAuthChange (callback: Function, action: any) {
  return asyncAction((data) => callback(data))
}
```

### createSagaChannel(startAndEndActions: string | string[], callback: Function, saga: any)

This works similar to `createSagaStream`, but opens a channel when receives a start action and closes the channel when receives an end action.

```ts
import { createSagaChannel } from 'redux-saga-tools'

export default [
  createSagaChannel(
    ['SIGN_IN_USER_SUCCESS', 'SIGN_OUT_USER_SUCCESS']
    onChangeTodo,
    'ON_CHANGE_TODO_BY_USER'
  )
]

function onChangeTodo (callback: Function, action: any) {
  return asyncAction((data) => callback(data))
}
```

## 2. Reducer

### createReducer(initialState: any, handlers: any)

```ts
import { createReducer } from 'redux-saga-tools'

function onUserSignIn(state: UserState, action: { user: User}): USerState {
  return {
    ...state,
    currentUser: action.user
  }
}

export default createReducer({}, {
  [UserActionType.SIGN_IN_USER_SUCCESS]: onUserSignIn,
  [UserActionType.SIGN_OUT_USER_SUCCESS]: onUserSignOut,
})
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

Copyright (c) 2018 Rinto Jose (rintoj)

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