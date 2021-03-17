import produce, { Draft } from 'immer'

import {
  ActionCreator,
  ActionWithoutPayload,
  ActionWithPayload,
  Case,
  ReducerActions,
} from './types'

export * from './types'

export function createReducer<State>(initialState: State) {
  const cases: any[] = []
  function caseBinder<Action extends ActionCreator>(
    effect: Action,
    reducer: (
      draftState: Draft<State>,
      action: ReturnType<Action>,
      state: Readonly<State>,
    ) => void | State,
  ) {
    cases.push([ effect, reducer ])
  }

  function reducer(state: State = initialState, action: ReducerActions) {
    return cases.reduce(
      (
        currentState: State,
        [creator, caseReducer]: Case<ActionCreator, State>,
      ) => 
        produce(currentState, (draft) => {
          if (action.type === creator.toString()) {
            const newState = caseReducer(draft, action, state)

            return newState === undefined ? draft : newState
          }

          return draft
        }),
      state,
    ) as State
  }

  return { reducer, addCase: caseBinder }
}

// export function customDispatch(hookState: any, hookDispatch: any) {
//   return function dispatch(action: any) {
//     if (typeof action === 'function') {
//       action(hookDispatch, hookState)
//     } else {
//       hookDispatch(action)
//     }
//   }
// }

export function emptyAction(type: string): () => ActionWithoutPayload {
  function emptyActionCreator() {
    return {
      type,
    }
  }

  emptyActionCreator.toString = () => type
  return emptyActionCreator
}

export function action<T>(type: string) {
  function actionCreator(payload: T): ActionWithPayload<T> {
    return {
      type,
      payload,
    }
  }

  actionCreator.toString = () => type
  return actionCreator
}
