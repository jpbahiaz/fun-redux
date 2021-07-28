# Fun-Redux

Conjunto de utilitários para facilitar o gerenciamento de estado utilizando os princípios do Redux.

## Install
```yarn add fun-redux```
or
```npm install fun-redux```

## Empty Actions
Retorna um action creator que não possui payload
```ts
  import { emptyAction } from 'fun-redux'

  const increment = emptyAction('actions/increment')

  console.log(increment())
  // { type: 'actions/increment' }
```

## Actions
Retorna um action creator que recebe como argumento o payload que será enviado na action.
```ts
  import { action } from 'fun-redux'

  const increment = action<number>('actions/increment')

  console.log(increment(10))
  // { type: 'actions/increment', payload: 10 }

  const incrementValue = action<{ value: number }>('actions/incrementValue')

  console.log(incrementValue({ vlaue: 8 }))
  // { type: 'actions/incrementValue', payload: { value: 8 } }
```

## Action Types
Utilitário para retornar todas as actions possíveis para determinado import
```ts
  // actions.ts
  import { action, emptyAction, ActionTypes } from 'fun-redux'

  export const increment = emptyAction('actions/increment')
  export const decrement = emptyAction('actions/decrement')
  export const incrementValue = action<number>('actions/incrementValue')

  // index.ts
  import * as actions from './actions'

  ActionTypes<typeof actions>
  // ActionWithPayload | ActionWithPayload<number>
  // (ou seja: { type: string } | { type: string, payload: number })
```

## Create Reducer
Utilitário para gerar reducers com tipagem dinâmica orientada às actions importadas.
Recebe como parâmetro de tipagem o type do State e como parâmetro de função o initialState.

Cada 'case' do reducer pode ser adicionado pela função `addCase(action, reducer)` que irá tipar o reducer passado como parâmetro baseado na action do parâmetro.

A lib Immer é utilizada para facilitar a alteração segura do estado do redux. Sendo assim, para todo reducer é passado um 'draft' do state.

```ts
  // reducer.ts
  import { createReducer } from 'fun-redux'

  import * as actions from './actions'

  type State = { value: number }

  const initialState: State = {
    value: 0
  }

  const { reducer, addCase } = createReducer<State>(initialState)

  export const exampleReducer = reducer

  addCase(actions.increment, (draftState) => {
    draftState.value += 1
  })
  addCase(actions.decrement, (draftState) => {
    draftState.value -= 1
  })
  addCase(actions.incrementValue, (draftState, action) => {
    draftState.value += action.payload
  })
  addCase(actions.decrementValue, (draftState, action) => {
    draftState.value += action.payload
  })
  addCase(actions.incrementIfEqual, (draftState, action, state) => {
    if (state.value === action.payload) {
      draftState.value += action.payload
    }
  })
```

## App Thunk
Essa abstração proporciona uma tipagem dinâmica para os parâmetros do thunk `(dispatch, getState) => void` da lib [redux-thunk](https://github.com/reduxjs/redux-thunk)
Com isso o dispatch é tipado com todas as ações possíveis para o thunk e o getState é tipado com o estado da aplicação.

```ts
  /*
    src/
      modules/
        account/
        login/
        ui/
        error/
      rootReducer.ts
      store.ts
  */

  // rootReducer.ts
  import { combineReducers } from 'redux'

  // Types
  import { AccountState } from './account/types'
  import { LoginState } from './login/types'
  import { UIState } from './ui/types'
  import { ErrorState } from './error/types'

  // Reducers
  import { accountReducer } from './account/reducer'
  import { loginReducer } from './login/reducer'
  import { uiReducer } from './ui/reducer'
  import { errorReducer } from './error/reducer'

  export type AppState = {
    account: AccountState
    login: LoginState
    ui: UIState
    error: ErrorState
  }

  export default combineReducers({
    account: accountReducer
    login: loginReducer
    ui: uiReducer
    error: errorReducer
  })

  // store.ts
  import { createStore, applyMiddleware, Action } from 'redux'
  import thunk, { ThunkAction } from 'redux-thunk'

  import rootReducer, { AppState } from './rootReducer'

  const store = createStore(rootReducer, applyMiddleware(thunk))

  export type AppThunk<
    ActionTypes extends Action,
    ReturnType = void
  > = ThunkAction<ReturnType, AppState, unknown, ActionTypes>
  
  export default store
```

## Uso com o redux-thunk
**IMPORTANTE:** Para que tudo funcione como o esperado é necessário que as actions e os thunks estejam em arquivos separados.
Isso possibilita a aplicação do utilitário ActionTypes para retornar o tipo de todas as actions possíveis.

```ts
  // actions.ts
  import { action, emptyAction } from 'fun-redux'

  export const getUserSuccess = action<User>('users/getUserSuccess')
  export const getUserError = emptyAction('users/getUserError')
  
  // thunks.ts
  import { ActionTypes } from 'redux-utils'
  import * as actions from './actions'

  export function getUser(id: number): AppThunk<ActionTypes<typeof actions>> {
    return (dispatch, getState) => {
      api.get(`/users/${id}`)
        .then(user => dispatch(actions.getUserSuccess(user)))
        .catch(() => dispatch(actions.getUserError()))
    }
  }
```
