"use strict"
/**
 * Live Arrays
 *
 * Implementation details:
 *
 * In order to keep things efficient, the general idea is to use LiveObject
 * traps when a property is set (e.g.: liveArray[5] = "foo"), but to use
 * dedicated logic when the array is mutated using the usual methods (`push`,
 * `pop`, `shift`, `unshift` and `splice`).
 */
const {
  constructor: { shortcuts, call },
  property: { hideLock }
} = require("@kisbox/helpers")

const Observable = require("./observable")
const $traps = require("./lib/traps")
const $events = require("./lib/events")

/* Definition */

class LiveArray extends Array {
  $forEach (callback) {
    setupTraps(this)

    this.$on("$add", ([item, index], returned, type, context) => {
      callback(item, index, context)
    })

    this.forEach(callback)
  }

  $forExit (callback) {
    setupTraps(this)

    this.$on("$remove", ([item], returned, type, context) => {
      callback(item, context)
    })
  }

  $map (generator) {
    // TODO: setup traps only for root liveArray (not mirrors)
    const map = generator ? this.map(generator) : this.slice()

    hideLock(map, "generator", generator)
    map.$listen(this, ["shift", "pop"], propagateShiftOrPop.bind(map))
    map.$listen(this, ["unshift", "push"], propagateUnshiftOrPush.bind(map))
    map.$listen(this, ["splice"], propagateSplice.bind(map))

    setupTraps(this)
    let handler = generator
      ? (item, previous, index) => map[index] = generator(item)
      : (item, previous, index) => map[index] = item
    map.$listen(this, "$set", handler)

    return map
  }

  $sort (compare) {
    const map = this.$map()
    map.$on("$change", $traps(map).sort(compare))
    return map
  }

  /**
   * With LiveArrays, `.sort()` is non-destructive and returns a new object.
   */
  sort () {
    const clone = this.slice()
    call(Array).sort(clone)
    return clone
  }

  /* Events */
  $add () {}
  $remove () {}
  $change () {}
}

// TODO: fix & use safe.
const { proto } = shortcuts(LiveArray)

/* Mixin */

// TODO: Find a better way to put it.
const mixinMethods = [
  "$trigger",
  "$on",
  "$off",
  "$listen",
  "$ignore",
  "$destroy"
]
mixinMethods.forEach((key) => proto[key] = Observable.prototype[key])

/* Trap-conscious wrappers */

const wrappedMethods = ["push", "pop", "shift", "unshift", "splice"]

function methodWrapper (method) {
  return function () {
    if ($traps.isOn(this)) {
      // Traps are set - apply the method to the wrapped array & update traps.
      const trapped = $traps(this)
      const returned = trapped[method].apply(trapped, arguments)
      updateTraps(this)
      return returned
    } else {
      // Traps are not set - it's a normal array.
      return Array.prototype[method].apply(this, arguments)
    }
  }
}

wrappedMethods.forEach((key) => proto[key] = methodWrapper(key))

/* Helpers: Setup Traps */

function setupTraps (liveArray) {
  if ($traps.isOn(liveArray)) return

  $traps.set(liveArray, [])
  liveArray.forEach((_, key) => $traps.trapValue(liveArray, key))
}

function updateTraps (liveArray) {
  // `trapped` contains the actual data - `liveArray` has the getter/setters.
  const trapped = $traps(liveArray)
  const diff = liveArray.length - trapped.length

  if (diff < 0) {
    // Add traps.
    for (let key = liveArray.length; key < trapped.length; key++) {
      liveArray[key] = trapped[key] // Required by `$trap.trapValue()`.
      delete trapped[key] // Required by `$trap.trapValue()`.
      $traps.trapValue(liveArray, key)
    }
  } else if (diff > 0) {
    // Remove traps.
    for (let key = trapped.length; key < liveArray.length; key++) {
      $events(liveArray).delete(key)
    }
    liveArray.length = trapped.length
  }
}

/* Helpers: Propagatate Actions */

function propagateShiftOrPop (args, returned, method) {
  this[method]()
}

function propagateUnshiftOrPush ([item], returned, method) {
  if (this.generator) item = this.generator(item)
  this[method](item)
}

function propagateSplice ([index, removed, ...added]) {
  if (this.generator) added = added.map(this.generator)
  this.splice(index, removed, ...added)
}

/* Notify Changes */

proto.$on("$set", function (item, previous, index) {
  this.$add(item, index)
  this.$remove(previous)
})

proto.$on(["shift", "pop"], function (args, returned) {
  this.$remove(returned)
})

proto.$on("push", function ([item]) {
  this.$add(item, this.length - 1)
})

proto.$on("unshift", function ([item]) {
  this.$add(item, 0)
})

proto.$on("splice", function (args, returned) {
  const [index, , ...added] = args
  if (added.length) {
    added.forEach((item, rindex) => {
      this.$add(item, index + rindex)
    })
  }
  if (returned.length) {
    returned.forEach((item) => {
      this.$remove(item)
    })
  }
})

proto.$on(["$set", "push", "pop", "shift", "unshift", "splice"], function () {
  this.$change()
})

/* Export */
module.exports = LiveArray
