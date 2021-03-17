import { Draft } from 'immer'

export type ActionWithPayload<Payload = any> = {
  type: string
  payload: Payload
}

export type ActionWithoutPayload = { type: string }

export type ReducerActions = ActionWithoutPayload | ActionWithPayload<any>

export type EmptyActionCreator = () => ActionWithoutPayload

export type ActionCreator = (...args: any[]) => { type: string } | void

export type Case<Action extends ActionCreator, State> = [
  Action,
  (
    draft: Draft<State>,
    action: ReturnType<Action>,
    state: Readonly<State>,
  ) => State | void
]

export type ActionTypes<Obj> = Obj extends Record<any, any>
  ? {
      [K in keyof Obj]: ReturnType<Obj[K]>
    }[keyof Obj]
  : never
