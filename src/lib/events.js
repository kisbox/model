"use strict"
/**
 * $events composable.
 *
 * @private
 **/
const {
  $meta: { $util },
  error: { noThrow }
} = require("@kisbox/helpers")

const { getPrototypeOf } = Object

/* Definition */
const $events = $util("/events/", {
  constructor: function (target) {
    this.provider = target
    this.clear()
  },

  clear () {
    this.handlers = {}
  },

  put (type, handler) {
    if (!this.handlers[type]) {
      this.handlers[type] = new Set()
    }
    this.handlers[type].add(handler)
  },

  delete (type, handler) {
    if (!handler) {
      delete this.handlers[type]
    } else if (this.handlers[type]) {
      this.handlers[type].delete(handler)
    }
  },

  trigger (context, type, args) {
    // Local handlers.
    reallyTrigger(context, this.handlers[type], args)
    reallyTrigger(context, this.handlers["*"], args)

    // Inherited handlers.
    const proto = getPrototypeOf(this.provider)
    const inherited = $events.get(proto)
    if (inherited) inherited.trigger(context, type, args)
  }
})

function reallyTrigger (context, handlers, args) {
  if (!handlers) return

  handlers.forEach(handler => {
    noThrow(() => handler.apply(context, args))
  })
}

/* Exports */
module.exports = $events
