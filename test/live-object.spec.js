/* eslint-env jasmine */
"use strict"

const LiveObject = require("../src/live-object.js")

/* Definition */

describe("liveObject", () => {
  let obj, live, live2
  beforeEach(() => {
    obj = {}
    live = new LiveObject()
    live2 = new LiveObject()
  })

  /* $link/$import/$export/$pick */
  describe(".$link()", () => {
    it("links properties of two objects together", () => {
      live.$link(live2, ["foo", "bar"])
      expect(live.foo).toBe(undefined)
      expect(live.bar).toBe(undefined)
      expect(live.foo).toBe(live2.foo)
      expect(live.bar).toBe(live2.bar)

      live.foo = true
      expect(live.foo).toBe(true)
      expect(live2.foo).toBe(true)

      live2.bar = false
      expect(live2.bar).toBe(false)
      expect(live.bar).toBe(false)
    })
  })

  /* $pull/$push */
  describe(".$pull()", () => {
    it("binds two properties together (same object)", () => {
      live.foo = false
      live.$pull("bar", live, "foo")
      expect(live.foo).toBe(false)
      expect(live.bar).toBe(false)

      live.foo = true
      expect(live.foo).toBe(true)
      expect(live.bar).toBe(true)
    })

    it("binds two properties together (different objects)", () => {
      live.foo = false
      live2.$pull("foo", live)
      expect(live.foo).toBe(false)
      expect(live2.foo).toBe(false)

      live.foo = true
      expect(live.foo).toBe(true)
      expect(live2.foo).toBe(true)

      live2.$pull("bar", live, "foo")
      expect(live2.bar).toBe(true)
    })

    it("picks properties from non-live objects", () => {
      obj.foo = false
      live.$pull("foo", obj)
      expect(obj.foo).toBe(false)
      expect(live.foo).toBe(false)

      obj.foo = true
      expect(obj.foo).toBe(true)
      expect(live.foo).toBe(false)

      live.$pull("bar", obj, "foo")
      expect(live.bar).toBe(true)
    })

    it("creates enumerable properties", () => {
      live.foo = true
      live2.$pull("foo", live)
      live2.$pull("bar", live)
      expect(Object.keys(live)).toEqual(["foo", "bar"])
      expect(Object.keys(live2)).toEqual(["foo", "bar"])
    })
  })

  describe(".$push()", () => {
    it("binds two properties together (same object)", () => {
      live.foo = false
      live.$push("foo", live, "bar")
      expect(live.foo).toBe(false)
      expect(live.bar).toBe(false)

      live.foo = true
      expect(live.foo).toBe(true)
      expect(live.bar).toBe(true)
    })

    it("binds two properties together (different objects)", () => {
      live.foo = false
      live.$push("foo", live2)
      expect(live.foo).toBe(false)
      expect(live2.foo).toBe(false)

      live.foo = true
      expect(live.foo).toBe(true)
      expect(live2.foo).toBe(true)

      live.$push("foo", live2, "bar")
      expect(live2.bar).toBe(true)
    })

    it("pushes changes to non-live objects", () => {
      live.foo = false
      live.$push("foo", obj)
      expect(live.foo).toBe(false)
      expect(obj.foo).toBe(false)

      live.foo = true
      expect(live.foo).toBe(true)
      expect(obj.foo).toBe(true)

      live.$push("foo", obj, "bar")
      expect(obj.bar).toBe(true)
    })

    it("creates enumerable properties", () => {
      live.foo = true
      live.$push("foo", live2)
      live.$push("bar", live2)
      expect(Object.keys(live)).toEqual(["foo", "bar"])
      expect(Object.keys(live2)).toEqual(["foo", "bar"])
    })
  })

  /* $define/$compute/$set */

  describe(".$define()", () => {
    it("defines a dynamic property", () => {
      live.$define("foo", ["bar", "baz"], () => live.bar + live.baz)
      expect(live.foo).toEqual(NaN)

      live.bar = 2
      expect(live.foo).toEqual(NaN)

      live.baz = 3
      expect(live.foo).toBe(5)
      expect(Object.keys(live)).toEqual(["bar", "baz", "foo"])
    })

    it("creates enumerable properties", () => {
      live.$define("foo", ["bar", "baz"], () => live.bar + live.baz)
      expect(Object.keys(live)).toEqual(["bar", "baz", "foo"])
    })
  })

  describe(".$set()", () => {
    it("force key change", () => {
      let count = 0
      live.$on("foo", () => count++)
      expect(count).toBe(0)
      live.foo = "bar"
      expect(count).toBe(1)
      live.foo = "bar"
      expect(count).toBe(1)
      live.$set("foo", "bar")
      expect(count).toBe(2)
    })
  })
})
