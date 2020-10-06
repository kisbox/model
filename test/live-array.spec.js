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
      fullTest(liveArray, () => {
        expect(liveMap).toEqual(liveArray)
      })
    })

    it("produces a live projection", () => {
      const transform = (x) => x + 1
      const liveMap = liveArray.$map((x) => x + 1)
      fullTest(liveArray, () => {
        expect(liveMap).toEqual(liveArray.map(transform))
      })
    })
  })

  describe(".$sort", () => {
    it("produces a live sorted array", () => {
      liveArray.push(0)

      const compare = (a, b) => a - b
      const liveSorted = liveArray.$sort(compare)

      fullTest(liveArray, () => {
        expect(liveSorted).toEqual(liveArray.sort(compare))
      })
    })
  })
})

/* Helpers */
function fullTest (target, callback) {
  callback()
  fullTest.steps.forEach((step) => {
    step(target)
    callback()
  })
}

fullTest.steps = [
  (target) => target.push(1),
  (target) => target.pop(),
  (target) => target.shift(),
  (target) => target.unshift(2),
  (target) => target.splice(1, 0, 3, 4),
  (target) => target.splice(1, 2),
  (target) => target[0] = 5
]
