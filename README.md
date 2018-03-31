# Hyperflux
<!-- 
[![Travis CI](https://img.shields.io/travis/hyperflux/hyperflux/master.svg)](https://travis-ci.org/hyperflux/hyperflux) [![npm](https://img.shields.io/npm/v/hyperflux.svg)](https://www.npmjs.org/package/hyperflux) [![Slack](https://hyperfluxjs.herokuapp.com/badge.svg)](https://hyperfluxjs.herokuapp.com "Join us") -->

Hyperflux is a JavaScript library for state management, using [Hyperapp](https://github.com/hyperflux/hyperflux)'s code.

> Hyperapp is a framework which additionally provides view functionality. If you aren't already using a view library (e.g., React), then you probably want Hyperapp. Hyperflux is more like a replacement for Redux.

* **Pragmatic** — Hyperflux holds firm on the functional programming front when managing your state, but takes a pragmatic approach to allowing for side effects and asynchronous actions.
* **Debouncing** — Multiple synchronous actions will only cause the onChange trigger to happen once. Updates are always asynchronous.

## Getting Started

Our first example is a counter that can be incremented or decremented.

```js
import * as hyperflux from "hyperflux"

const state = {
	count: 0,
};

const actions = {
	inc: () => state => ({ count: state.count + 1 }),
	dec: () => state => ({ count: state.count - 1 }),
};

const print = state => console.log(`Count: ${state.count}`);

const app = hyperflux.app(state, actions, print);

app.inc();
// Synchronous action occurs before first print call
// log: "Count: 1"

setTimeout(app.inc, 0);
// log: "Count: 2"
setTimeout(() => {
	app.dec();
	app.dec();
}, 50);
// log: "Count: 0"
```

[Try out a counter app with vanilla DOM UI](https://jsfiddle.net/7cxxju0t/13/).

## Why tho?

You should consider this library instead of Redux because...

Redux is boilerplate heavy. Hyperflux doesn't need actions, actions types, or action creators. Instead you write a function like a reducer and use it directly as an action you can call from anywhere (no dispatching required). You also don't need to pass a dispatch method around or use middleware to use async actions or cause side-effects.

Surely there should be a tradeoff to this, right? Actually, there isn't much downside. Technically, Redux reducers are more pure, as Hyperflux actions can update the store through side-effects (calling other actions, or external functions). Depending on how you write your own code, this can affect how testable your code is. In Redux, those more difficult to test functions are just moved out to other modules, where they are still just as difficult to test.

How about integrating with React through react-redux and context? Using an observable library, it's simple to write a small higher-order function around `hyperflux.app()` which copies the Redux api, allowing you to use react-redux directly. Your `mapDispatchToProps` functions will be a little difference, working about the same as `mapStateToProps` since actions will just be properties on the "dispatch" object (actually the actions object). [Check out an example using Kefir here](https://jsfiddle.net/samsch/swtzLm9c/24/). Consider that the `createStore` wrapper would be effectively library code, and if you compare to the equivalent [Redux version](https://jsfiddle.net/samsch/ejrLuyvx/), it's shorter and simpler, but no less expressive or semantic.

## Installation

Install with npm or Yarn.

<pre>
npm i -D <a href=https://www.npmjs.com/package/hyperflux>hyperflux</a>
</pre>

Then with a module bundler like [Rollup](https://rollupjs.org) or [Webpack](https://webpack.js.org), use as you would anything else.

```js
import { app } from 'hyperflux';
// or
import * as hyperflux from 'hyperflux';
```

If you don't want to set up a build environment, you can download Hyperflux from a CDN like [unpkg.com](https://unpkg.com/hyperflux) and it will be globally available through the <samp>window.hyperflux</samp> object. We support all ES5-compliant browsers, including Internet Explorer 10 and above.

This is also the link to use in non-bundled sandboxes, like https://jsfiddle.net/.

```html
<script src="https://unpkg.com/hyperflux"></script>
```

## Overview

Hyperflux stores consist of three interconnected parts: the [state](#state), [actions](#actions), and an [onChange](#onChange) function you pass to it.

Once initialized, your store operates in a continuous, single-direction loop, taking in actions from users or from external events, updating the state, and calling the onChange function. Think of an action as a signal that notifies Hyperflux to update the state and schedule the next onChange call.

### State

The state is a plain JavaScript object that describes your entire program. It consists of all the dynamic data that is moved around in the application during its execution. The state cannot be mutated once it is created. We must use actions to update it.

```js
const state = {
  count: 0
}
```

Like any JavaScript object, the state can be a nested tree of objects. We refer to nested objects in the state as partial state. A single state tree does not conflict with modularity — see [Nested Actions](#nested-actions) to find out how to update deeply nested objects and split your state and actions.

```js
const state = {
  top: {
    count: 0
  },
  bottom: {
    count: 0
  }
}
```

### Actions

The only way to change the state is via actions. An action is a unary function (accepts a single argument) expecting a payload. The payload can be anything you want to pass into the action.

To update the state, an action should return a function that takes the current state and actions and returns a partial state object. The new state will be the result of a shallow merge between this object and the current state. Under the hood, Hyperflux wires every function from your actions to schedule a view redraw whenever the state changes.

```js
const actions = {
  down: value => state => ({ count: state.count - value }),
  up: value => state => ({ count: state.count + value })
}
```

When an action does not use previous state, you can simply return the partial state object instead of a function.

```js
const actions = {
  setValue: value => ({ value })
}
```

State updates are always immutable. Do not mutate the state object argument within an action and return it — the results are not what you expect (e.g., the view will not be redrawn).

Immutability enables time-travel debugging, helps prevent introducing hard-to-track-down bugs by making state changes more predictable, and allows cheap memoization of components using shallow equality <samp>===</samp> checks.

#### Asynchronous Actions

Actions used for side effects (writing to databases, sending a request to a server, etc.) don't need to have a return value. You may call an action from within another action or callback function. Actions which return a Promise, <samp>undefined</samp> or <samp>null</samp> will not trigger redraws or update the state.

```js
const actions = {
  upLater: value => (state, actions) => {
    setTimeout(actions.up, 1000, value)
  },
  up: value => state => ({ count: state.count + value })
}
```

An action can be an <samp>[async](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)</samp> function. Because <samp>async</samp> functions return a Promise, and not a partial state object, you need to call another action in order to update the state.

```js
const actions = {
  upLater: () => async (state, actions) => {
    await new Promise(done => setTimeout(done, 1000))
    actions.up(10)
  },
  up: value => state => ({ count: state.count + value })
}
```

#### Nested Actions

Actions can be nested inside namespaces. Updating deeply nested state is as easy as declaring actions inside an object in the same path as the part of the state you want to update.

```js
const state = {
  counter: {
    count: 0
  }
}

const actions = {
  counter: {
    down: value => state => ({ count: state.count - value }),
    up: value => state => ({ count: state.count + value })
  }
}
```

Nested actions will be passed just the slice of state they match against. If you also are using actions, you will get the related nested actions as well.

```js
const actions = {
  counter: {
    up: value => state => ({ count: state.count + value })
    upLater: value => (state, actions) => {
      setTimeout(actions.up, 1000, value)
    },
  }
}
```


## API

Hyperflux's API is a single function, expecting a specific set of arguments.

### app
```js
import * as hyperflux from 'hyperflux';
hyperflux.app(<State>, <Actions>, <OnChange>);
```

The `state` and `actions` shape is described above, but basically, `state` should be a plain object described your initial state; and `actions` should be a plain object where each property is either a nested object with the `actions` shape, or a function like:
```js
argument => <NewState> // NewState will be merged with the current state.
argument => (state, actions) => <NewState>
```
If you don't need the argument, state, or actions, you can omit them like `() => () => <NewState>`.

### OnChange
The onChange argument you pass to `hyperflux.app()` is a function which takes state and actions as arguments.
```js
const onChange = (state, actions) => {};
```
Any return value is ignored. This is the place to kick off rendering your view, or otherwise acting on new state.

The onChange function will only be called once per synchronous state update. So if you call three actions sequentially, onChange will only be called once.

## Usage with view libraries

Usually if you need state management in your app, you also will be using a view library. Hyperflux is easy to use with common libraries like React, or any view library where it can be updated with a function call.

### React

```jsx
import * as hyperflux from 'hyperflux';

const state = {
	count: 0,
};

const actions = {
	inc: () => state => ({ count: state.count + 1 }),
	dec: () => state => ({ count: state.count - 1 }),
};

const Counter = props => (
	<div>
    Count: {props.count} <button onClick={props.inc} >+</button> <button onClick={props.dec}>-</button>
  </div>
);

const render = (state, actions) => ReactDOM.render(
	<Counter
    count={state.count}
    inc={actions.inc}
    dec={actions.dec}
  />,
  document.getElementById('container')
);

hyperflux.app(state, actions, render);
```
[Play with live demo](https://jsfiddle.net/7cxxju0t/30/).

## License

Hyperflux is MIT licensed. See [LICENSE](LICENSE.md).
Originally forked from Hyperapp.
