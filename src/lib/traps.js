"use strict"
/**
 * $traps side-scope.
 *
 * @private
 **/
const {
  $meta: { $sideScope },
  any: { isPromise }
} = require("@kisbox/helpers")

const $events = require("./events")

// sideScope inherits from parents sideScopes.
const $traps = $sideScope("/traps/")

/* Library */

$traps.trapProperty = function (target, key) {
  if (typeof target[key] === "function") {
    $traps.trapFunction(target, key)
  } else {
    $traps.trapValue(target, key)
  }
}

$traps.trapFunction = function (target, key) {
  const wrapped = target[key]
  if (wrapped && wrapped.isTrapped) return

  Object.defineProperty(target, key, {
    configurable: false,
    writable: false,
    value () {
      return $traps.callFunction(this, key, wrapped, arguments)
    }
  })

  target[key].isTrapped = true
}

$traps.callFunction = function (context, key, wrapped, args) {
  const returned = wrapped.apply(context, args)
  const events = $events.get(context)

  if (isPromise(returned)) {
    returned.then(value => {
      events.trigger(context, key, [args, value, key, context])
    })
  } else {
    events.trigger(context, key, [args, returned, key, context])
  }

  return returned
}

$traps.trapValue = function (target, key) {
  const trapped = $traps(target)
  if (key in trapped) return

  trapped[key] = target[key]

  // enumerable by default
  let enumerable
  if (!(key in target)) enumerable = true

  Object.defineProperty(target, key, {
    configurable: true,
    enumerable,
    get () {
      return $traps(this)[key]
    },
    set (value) {
      $traps.setValue(this, key, value, true)
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
  }
}

/* Exports */
module.exports = $traps
