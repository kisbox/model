"use strict"
/**
 * Methods that allow to spread an object changes toward another.
 */
const { type } = require("@kisbox/utils")
const { call, xeach, keach, isInstance, noThrow } = require("@kisbox/helpers")

const Observable = require("./observable")
const $events = require("./lib/events")
const $traps = require("./lib/traps")

/* Definition */

class LiveObject extends Observable {
  /* link/import/export/pick */
  $link (target, keys) {
    if (!target) return

    safe.$pick(this, target, keys)
    safe.$export(this, target, keys)
    safe.$export(target, this, keys)
  }

  $export (target, keys, transformer) {
    if (!target) return

    xeach(keys, (key) => {
      safe.$push(this, key, target, key, transformer)
    })
  }

  $import (target, keys, transformer) {
    if (!target) return

    xeach(keys, (key) => {
      safe.$pull(this, key, target, key, transformer)
    })
  }

  $pick (target, keys, transformer) {
    if (!target) return

    xeach(keys, (key) => {
      if (key in target) {
        const value = target[key]
        this[key] = transformer ? transformer(value) : value
      }
    })
  }

  /* pull/push */
  $pull (key, target, targetKey = key, transformer) {
    if (!(targetKey in target)) return

    if (typeof target.$push === "function") {
      target.$push(targetKey, this, key, transformer)
    } else {
      const value = target[targetKey]
      this[key] = transformer ? transformer(value) : value
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
    setupDefinition(this, key, depends, definition, "safe")
  }

  $customDefine (key, depends, definition) {
    setupDefinition(this, key, depends, definition)
  }

  $compute (keys) {
    // trap.outdate?
    const events = $events.get(this)
    if (!events) return

    xeach(keys, (key) => {
      events.trigger(`outdate:${key}`)
    })
  }

  $set (keys, value) {
    keach(keys, value, (key, value) => {
      $traps.setValue(this, key, value || this[key])
    })
  }
}

const safe = call(LiveObject)

/* Helpers */
function setupDefinition (target, key, depends, definition, safeFlag) {
  const compute = function () {
    this[key] = computeDefinition(this, depends, definition, safeFlag)
  }
  target.$on(depends, compute)

  if (isInstance(target)) compute.call(target)

  // TODO: Plutôt utiliser `trap`
  $events(target).put(`outdate:${key}`, compute)
}

function computeDefinition (object, depends, definition, safeFlag) {
  const state = definitionDependsState(object, depends)

  if (state === undefined) {
    return undefined
  } else if (safeFlag && state) {
    return state
  } else {
    return noThrow(() => definition.call(object, object))
  }
}

function definitionDependsState (object, depends) {
  let error, promise

  for (let key of depends) {
    const value = object[key]
    if (value === undefined) {
      return
    } else if (!error) {
      if (type(value) === "error") {
        error = value
      } else if (!promise && type(value) === "promise") {
        promise = new Promise(() => {})
      }
    }
  }

  return error || promise || null
}

/* Export */
// TODO: encapsulate Trapped
module.exports = LiveObject
