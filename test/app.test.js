/* eslint-env jest */
import { app } from "../src"

beforeEach(() => {
  document.body.innerHTML = ""
})

test("debouncing", done => {
  const state = { value: 1 }

  const actions = {
    up: () => state => ({ value: state.value + 1 }),
    fire: () => (state, actions) => {
      actions.up()
      actions.up()
      actions.up()
      actions.up()
    }
  }

  const render = state => {
    expect(state.value).toBe(5)
    done()
  }

  app(state, actions, render).fire()
})

test("subviews / lazy components", done => {
  const state = { value: "foo" }
  const actions = {
    update: () => ({ value: "bar" })
  }

  let call = 0
  const render = (state, actions) => {
    if (call === 0) {
      expect(state.value).toBe("foo")
      call = 1
      actions.update()
    } else if (call === 1) {
      expect(state.value).toBe("bar")
      done()
    }
  }

  app(state, actions, render)
})
