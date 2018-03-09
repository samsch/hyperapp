import { app, ActionsType, OnUpdate } from "hyperapp"

namespace Counter {
  export interface State {
    count: number
  }

  export interface Actions {
    down(): State
    up(value: number): State
  }

  export const state: State = {
    count: 0
  }

  export const actions: ActionsType<State, Actions> = {
    down: () => state => ({ count: state.count - 1 }),
    up: (value: number) => state => ({
      count: state.count + value
    })
  }
}

const onUpdate: OnUpdate<Counter.State, Counter.Actions> = (
  state,
  actions
) => {}

app<Counter.State, Counter.Actions>(Counter.state, Counter.actions, onUpdate)
