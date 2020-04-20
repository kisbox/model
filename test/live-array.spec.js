/* eslint-env jasmine */
"use strict"

const LiveArray = require("../src/live-array.js")

/* Definition */

describe("liveArray", () => {
  let liveArray
  beforeEach(() => {
    liveArray = new LiveArray()
    liveArray.push(3)
  })

  it("is an instance of Array", () => {
    expect(liveArray instanceof Array).toBe(true)
  })

  it("is an instace of liveArray", () => {
    expect(liveArray instanceof LiveArray).toBe(true)
  })

  describe(".$forEach()", () => {
    it("calls callback on each item added to liveArray", () => {
      let sum = 0

      liveArray.$forEach((x) => sum += x)
      expect(sum).toBe(3)

      liveArray.push(5)
      expect(sum).toBe(8)

      liveArray.unshift(2)
      expect(sum).toBe(10)

      liveArray.splice(0, 1, 10, 30)
      expect(sum).toBe(50)

      liveArray[2] = 2
      expect(sum).toBe(52)
    })

    it("passes the index of each new element", () => {
      let focus

      liveArray.$forEach((item, index) => focus = index)
      expect(focus).toBe(0)

      liveArray.push(5)
      expect(focus).toBe(1)

      liveArray.unshift(2)
      expect(focus).toBe(0)

      liveArray.splice(1, 1, 10, 30)
      expect(focus).toBe(2)

      liveArray[2] = 2
      expect(focus).toBe(2)
    })

    it("passes its context", () => {
      liveArray.$forEach((item, index, context) => {
        expect(context).toBe(liveArray)
      })
    })
  })

  describe(".$forExit()", () => {
    it("calls callback on each item removed from liveArray", () => {
      let sum = 0
      liveArray.push(5)
      liveArray.push(8)

      liveArray.$forExit((x) => sum += x)
      expect(sum).toBe(0)

      liveArray.pop()
      expect(sum).toBe(8)

      liveArray.shift()
      expect(sum).toBe(11)

      liveArray.unshift(1)
      liveArray.unshift(1)
      liveArray.splice(0, 2, "foo", "bar")
      expect(sum).toBe(13)

      liveArray[2] = 2 // Remove previous value 5
      expect(sum).toBe(18)
    })

    it("passes its context", () => {
      liveArray.$forExit((_, context) => {
        expect(context).toBe(liveArray)
      })
      liveArray.pop()
    })
  })

  describe(".$map()", () => {
    it("produces a live map", () => {
      const liveMap = liveArray.$map()
      expect(liveMap).toEqual(liveArray)

      liveArray[0] = 12
      expect(liveMap).toEqual(liveArray)

      liveArray.push("foo")
      expect(liveMap).toEqual(liveArray)

      liveArray.unshift("bar")
      expect(liveMap).toEqual(liveArray)

      liveArray[2] = 21
      expect(liveMap).toEqual(liveArray)

      liveArray.pop()
      expect(liveMap).toEqual(liveArray)

      liveArray.shift()
      expect(liveMap).toEqual(liveArray)

      liveArray.splice(1, 0, "foo", "bar")
      expect(liveMap).toEqual(liveArray)

      liveArray.splice(1, 2)
      expect(liveMap).toEqual(liveArray)
    })
  })

  it("produces a live projection", () => {
    const liveMap = liveArray.$map((x) => x + 1)
    expect(liveMap).toEqual(liveArray.map((x) => x + 1))

    liveArray[0] = 12
    expect(liveMap).toEqual(liveArray.map((x) => x + 1))

    liveArray.push("foo")
    expect(liveMap).toEqual(liveArray.map((x) => x + 1))

    liveArray.unshift("bar")
    expect(liveMap).toEqual(liveArray.map((x) => x + 1))

    liveArray[2] = 21
    expect(liveMap).toEqual(liveArray.map((x) => x + 1))

    liveArray.pop()
    expect(liveMap).toEqual(liveArray.map((x) => x + 1))

    liveArray.shift()
    expect(liveMap).toEqual(liveArray.map((x) => x + 1))

    liveArray.splice(1, 0, "foo", "bar")
    expect(liveMap).toEqual(liveArray.map((x) => x + 1))

    liveArray.splice(1, 2)
    expect(liveMap).toEqual(liveArray.map((x) => x + 1))
  })
})
