/* eslint-env jest */
import { app } from "../src"

const mockDelay = () => new Promise(resolve => setTimeout(resolve, 50))

beforeEach(() => {
  document.body.innerHTML = ""
})

test("sync updates", done => {
  const state = {
    value: 1
  }

  const actions = {
    up: () => state => ({ value: state.value + 1 })
  }

  const render = state => {
    expect(state.value).toBe(2)
    done()
  }

  app(state, actions, render).up()
})

test("async updates", done => {
  const state = {
    value: 2
  }

  const actions = {
    up: data => state => ({ value: state.value + data }),
    upAsync: data => (state, actions) =>
      mockDelay().then(() => actions.up(data))
  }

  let call = 0
  const render = state => {
    if (call === 0) {
      expect(state.value).toBe(2)
      call = 1
    } else if (call === 1) {
      expect(state.value).toBe(3)
      done()
    }
  }

  app(state, actions, render).upAsync(1)
})

test("call action within action", done => {
  const state = {
    value: 1
  }

  const actions = {
    upAndFoo: () => (state, actions) => {
      actions.up()
      return {
        foo: true
      }
    },
    up: () => state => ({
      value: state.value + 1
    })
  }

  const render = state => {
    expect(state).toEqual({
      value: 2,
      foo: true
    })
    done()
  }

  app(state, actions, render).upAndFoo()
})
