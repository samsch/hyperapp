export function app(state, actions, onUpdate) {
  var skipRender
  var globalState = clone(state)
  var wiredActions = wireStateToActions([], globalState, clone(actions))

  scheduleRender()

  return wiredActions

  function render() {
    skipRender = false
    onUpdate(globalState, wiredActions)
  }

  function scheduleRender() {
    if (!skipRender && (skipRender = true)) setTimeout(render)
  }

  function clone(target, source) {
    var out = {}

    for (var t in target) out[t] = target[t]
    for (var s in source) out[s] = source[s]

    return out
  }

  function set(path, value, source) {
    var target = {}
    if (path.length) {
      target[path[0]] =
        path.length > 1 ? set(path.slice(1), value, source[path[0]]) : value
      return clone(source, target)
    }
    return value
  }

  function get(path, source) {
    var i = 0
    while (i < path.length) source = source[path[i++]]
    return source
  }

  function wireStateToActions(path, state, actions) {
    for (var key in actions) {
      typeof actions[key] === "function"
        ? (function(key, action) {
            actions[key] = function(data) {
              var result = action(data)

              if (typeof result === "function") {
                result = result(get(path, globalState), actions)
              }

              if (
                result &&
                result !== (state = get(path, globalState)) &&
                !result.then // !isPromise
              ) {
                scheduleRender(
                  (globalState = set(path, clone(state, result), globalState))
                )
              }

              return result
            }
          })(key, actions[key])
        : wireStateToActions(
            path.concat(key),
            (state[key] = clone(state[key])),
            (actions[key] = clone(actions[key]))
          )
    }

    return actions
  }
}
