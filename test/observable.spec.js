/* eslint-env jasmine */
"use strict"

const Observable = require("../src/observable.js")

/* Specs */

describe("Observable", () => {
  it("is a Constructor", () => {
    expect(new Observable() instanceof Observable).toBe(true)
  })
})

describe("observable", () => {
  let observable
  beforeEach(() => observable = new Observable())

  describe(".$on()", () => {
    it("traps a value", () => {
      let triggered = false
      observable.$on("foo", () => triggered = true)
      observable.foo = true
      expect(triggered).toBe(true)
      expect(observable.foo).toBe(true)
      expect(Object.keys(observable)).toEqual(["foo"])
    })

    it("passes [value, old, key, context] when trapping values", () => {
      observable.foo = "bar"
      observable.$on("foo", (value, old, key, context) => {
        expect(value).toBe("baz")
        expect(key).toBe("foo")
        expect(context).toBe(observable)
        expect(old).toBe("bar")
      })
      observable.foo = "baz"
    })

    it("traps an action", () => {
      let triggered = false
      observable.action = () => {}
      observable.$on("action", () => triggered = true)
      observable.action()
      expect(triggered).toBe(true)
      expect(typeof observable.action).toBe("function")
      expect(Object.keys(observable)).toEqual(["action"])
    })

    it("passes [arguments, returned, key, context] when trapping actions", () => {
      observable.action = () => 1234
      observable.$on("action", (args, returned, key, context) => {
        expect(returned).toBe(1234)
        expect(Array.from(args)).toEqual(["foo", "bar"])
        expect(key).toBe("action")
        expect(context).toBe(observable)
      })
      observable.action("foo", "bar")
    })
  })

  describe(".$off()", () => {
    const callback1 = function () {
      this.count += 1
    }

    beforeEach(() => {
      observable.count = 0
      observable.$on("foo", callback1)
      observable.$on("foo", function () {
        this.count += 2
      })
      observable.$on("bar", function () {
        this.count += 4
      })
    })

    it("removes a given callback", () => {
      observable.$off("foo", callback1)
      observable.$trigger("foo")
      observable.$trigger("bar")
      expect(observable.count).toBe(6)
    })

    it("removes a given event", () => {
      observable.$off("foo")
      observable.$trigger("foo")
      observable.$trigger("bar")
      expect(observable.count).toBe(4)
    })

    it("removes all events", () => {
      observable.$off()
      observable.$trigger("foo")
      observable.$trigger("bar")
      expect(observable.count).toBe(0)
    })
  })

  describe(".$trigger()", () => {
    it("triggers events", () => {
      let triggered = false
      observable.$on("foo", () => triggered = true)
      expect(triggered).toBe(false)

      observable.$trigger("foo")
      expect(triggered).toBe(true)
    })

    it("passes its arguments to callbacks", () => {
      observable.$on("foo", function () {
        expect(Array.from(arguments)).toEqual(["bar", "baz"])
      })
      observable.$trigger("foo", "bar", "baz")
    })

    it("passes its context to callbacks", () => {
      observable.$on("foo", function () {
        expect(this).toBe(observable)
      })
      observable.$trigger("foo")
    })
  })

  describe(".$listen", () => {
    it("Adds callback for other observable events", () => {
      const obs2 = new Observable()
      observable.$listen(obs2, "foo", () => observable.bar = "baz")
      obs2.$trigger("foo")
      expect(observable.bar).toBe("baz")
    })
  })

  describe(".$ignore", () => {
    it("Removes callback for other observable events", () => {})
  })
})
