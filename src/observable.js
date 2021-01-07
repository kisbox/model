"use strict"
/**
 * Observable: extends Objects with event capabilities.
 *
 * @exports Observable
 */
const { call, xeach, keach } = require("@kisbox/helpers")

const $events = require("./lib/events")
const $traps = require("./lib/traps")

/* Definition */

class Observable {
  /* (type, handler)
   * ([...types], handler)
   * ({ ...type: handler })
   */
  $on (types, handler) {
    keach(types, handler, (type, handler) => {
      $traps.trapProperty(this, type)
      // TODO: $events should handle property trapping when relevent
      $events(this).put(type, handler)
    })
  }

  /* (type, [handler])
   * ([...types], [handler])
   * ({ ...type: handler })
   */
  $off (types, handler) {
    if (!types) {
      // delete this[$events.symbol]?
      $events(this).clear()
    } else {
      keach(types, handler, (type, handler) => {
        $events(this).delete(type, handler)
      })
    }
  }

  $trap (types) {
    xeach(types, (type) => {
      $traps.trapProperty(this, type)
    })
  }

  // Move $set here?

  /* (type, ...args)
   * ([...types], ...args)
   *
   * TODO: remove this one! :)
   */
  $trigger (types, ...args) {
    xeach(types, (type) => {
      const events = $events.get(this)
      if (events) events.trigger(this, type, args)
    })
  }

  // TODO: memory management
  $listen (target, events, callback) {
    keach(events, callback, (event, callback) => {
      safe.$on(target, event, callback)
    })
  }

  $ignore (target, events, callback) {
    keach(events, callback, (event, callback) => {
      safe.$off(target, event, callback)
    })
  }

  // TODO: replace by melt
  $destroy () {}
  $change () {}
}

const safe = call(Observable)

/* Export */
module.exports = Observable
