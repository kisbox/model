"use strict"
/**
 * Methods that allow to spread an object changes toward another.
 */
const { forArgs } = require("@kisbox/utils")

const {
  constructor: { shortcuts, call }
} = require("@kisbox/helpers")

const Observable = require("./observable")
const $events = require("./lib/events")
const $traps = require("./lib/traps")

/* Definition */

class LiveObject extends Observable {
  /* link/import/export/pick */
  $link (target, keys) {
    safe.$pick(this, target, keys)
    safe.$export(this, target, keys)
    safe.$export(target, this, keys)
  }

  $export (target, keys, transformer) {
    forArgs(["value", "atoms"], arguments, (target, key) => {
      safe.$push(this, key, target, key, transformer)
    })
  }

  $import (target, keys, transformer) {
    forArgs(["value", "atoms"], arguments, (target, key) => {
      if (key in target) {
        safe.$pull(this, key, target, key, transformer)
      }
    })
  }

  $pick (target, keys, transformer) {
    forArgs(["value", "atoms"], arguments, (target, key) => {
      if (key in target) {
        const value = target[key]
        this[key] = transformer ? transformer(value) : value
      }
    })
  }

  /* pull/push */
  $pull (key, target, targetKey = key, transformer) {
    if (typeof target.$push === "function") {
      target.$push(targetKey, this, key, transformer)
    } else {
      if (targetKey in target) {
        const value = target[targetKey]
        this[key] = transformer ? transformer(value) : value
      }
    }
  }

  $push (key, target, targetKey = key, transformer) {
    const callback = transformer
      ? () => target[targetKey] = transformer(this[key])
      : () => target[targetKey] = this[key]

    if (target !== this && typeof target.$listen === "function") {
      target.$listen(this, key, callback)
    } else {
      safe.$on(this, key, callback)
    }

    if (key in this) callback()
  }

  /* $define, $compute, $set */
  $define (key, depends, definition) {
    const compute = function () {
      this[key] = definition.call(this, this)
    }
    this.$on(depends, compute)

    // TODO: Plutôt utiliser `trap`
    $events(this).put(`outdate:${key}`, compute)
  }

  $compute () {
    // trap.outdate?
    const events = $events.get(this)
    if (!events) return

    forArgs(["atoms"], arguments, key => {
      events.trigger(`outdate:${key}`)
    })
  }

  $set () {
    forArgs(["keys:atom"], arguments, (key, value) => {
      $traps.setValue(this, key, value)
    })
  }
}

// TODO: make it cleaner
const { safe } = shortcuts(LiveObject)
Object.assign(safe, call(Observable))

/* Export */
// TODO: encapsulate Trapped
module.exports = LiveObject