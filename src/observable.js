"use strict"
/**
 * Observable: extends Objects with event capabilities.
 *
 * @exports Observable
 */
const { forArgs } = require("@kisbox/utils")

const {
  constructor: { shortcuts }
} = require("@kisbox/helpers")

const $events = require("./lib/events")
const $traps = require("./lib/traps")

/* Definition */

class Observable {
  /* (type, handler)
   * ([...types], handler)
   * ({ ...type: handler })
   */
  $on () {
    forArgs(["keys:atom"], arguments, (type, handler) => {
      $traps.trapProperty(this, type)
      $events(this).put(type, handler)
    })
  }

  /* (type, [handler])
   * ([...types], [handler])
   * ({ ...type: handler })
   */
  $off (types) {
    if (!types) {
      // delete this[$events.symbol]?
      $events(this).clear()
    } else {
      forArgs(["keys:atom"], arguments, (type, handler) => {
        $events(this).delete(type, handler)
      })
    }
  }

  // Move $set here?

  /* (type, ...args)
   * ([...types], ...args)
   *
   * TODO: remove this one! :)
   */
  $trigger (types, ...args) {
    forArgs(["atoms"], [types], type => {
      const events = $events.get(this)
      if (events) events.trigger(this, type, args)
    })
  }

  // TODO: memory management
  $listen () {
    forArgs(["value", "keys:atom"], arguments, (target, event, callback) => {
      safe.$on(target, event, callback)
    })
  }

  $ignore () {
    forArgs(["value", "keys:atom"], arguments, (target, event, callback) => {
      safe.$off(target, event, callback)
    })
  }

  // TODO: replace by melt
  $destroy () {}
}

const { safe } = shortcuts(Observable)

/* Export */
module.exports = Observable
