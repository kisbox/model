"use strict"
/**
 * $traps side-scope.
 *
 * @private
 **/

const { type } = require("@kisbox/utils")
const { $sideScope, either, lock, setProperty } = require("@kisbox/helpers")

const $events = require("./events")

// sideScope inherits from parents sideScopes.
const $traps = $sideScope("/traps/")

/* Library */

$traps.trapProperty = function (target, key, guard) {
  if (typeof target[key] === "function") {
    $traps.trapFunction(target, key)
  } else {
    $traps.trapValue(target, key, guard)
  }
}

$traps.trapFunction = function (target, key) {
  const wrapped = target[key]
  if (wrapped && wrapped.isTrapped) return

  lock(target, key, function () {
    return $traps.callFunction(this, key, wrapped, arguments)
  })
  target[key].isTrapped = true
}

$traps.callFunction = function (context, key, wrapped, args) {
  const returned = wrapped.apply(context, args)
  const events = $events.get(context)

  if (type(returned) === "promise") {
    returned.then((value) => {
      events.trigger(context, key, [args, value, key, context])
    })
  } else {
    events.trigger(context, key, [args, returned, key, context])
  }

  return returned
}

$traps.trapValue = function (target, key, guard) {
  const trapped = $traps(target)
  if (key in trapped) return

  trapped[key] = filter(guard, target[key])

  setProperty(target, key, {
    get () {
      return $traps(this)[key]
    },
    set (value) {
      const filtered = filter(guard, value)
      $traps.setValue(this, key, filtered, true)
    }
  })
}

/*
 * Update trapped value & emit an event if **check** is false or if **value**
 * changed.
 */
$traps.setValue = function (target, key, value, check) {
  const trapped = $traps(target)
  const old = trapped[key]

  if (!(check && value === old)) {
    trapped[key] = value

    // TODO: avoid triggering "*" twice :(
    const events = $events(target)
    events.trigger(target, key, [value, old, key, target])
    events.trigger(target, "$set", [value, old, key, target])

    // Auto-update promises...
    if (type(value) === "promise") {
      value
        .catch((error) => {
          console.error(error)
          return error
        })
        .then((resolved) => {
          // ... only when key hasn't been changed meanwhile.
          if (target[key] === value) {
            $traps.setValue(target, key, resolved)
          }
        })
    }
  }
}

/* Helpers */
function filter (func, value) {
  return func ? either(func(value), value) : value
}

/* Exports */
module.exports = $traps
