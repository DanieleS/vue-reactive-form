import { describe, it, expect } from "vitest"
import { ref } from "@vue/reactivity"
import { createInputControl } from "../inputControl"

describe("createInputControl", () => {
  describe("When state is a primitive", () => {
    it("should expose the correct initial state and defaultValue", () => {
      const formState = ref("bar")
      const defaultFormState = ref("bar")
      const control = createInputControl(formState, defaultFormState)

      expect(control.state.value).toBe("bar")
      expect(control.defaultValue.value).toBe("bar")
      expect(control.dirty.value).toBe(false)
    })

    it("should handle state changes and dirty detection", () => {
      const formState = ref("bar")
      const defaultFormState = ref("bar")
      const control = createInputControl(formState, defaultFormState)

      control.state.value = "baz"
      expect(control.state.value).toBe("baz")
      expect(control.dirty.value).toBe(true)
    })

    it("should reset to default value and clear dirty state", () => {
      const formState = ref("baz")
      const defaultFormState = ref("bar")
      const control = createInputControl(formState, defaultFormState)

      control.state.value = "baz"
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toBe("bar")
      expect(control.dirty.value).toBe(false)
    })

    it("should clear the value and set dirty to true", () => {
      const formState = ref("bar")
      const defaultFormState = ref("bar")
      const control = createInputControl(formState, defaultFormState)

      control.clear()
      expect(control.state.value).toBe(undefined)
      expect(control.dirty.value).toBe(true)
    })

    it("should update the default value", () => {
      const formState = ref("bar")
      const defaultFormState = ref("bar")
      const control = createInputControl(formState, defaultFormState)

      control.updateDefaultValue("qux")
      expect(control.defaultValue.value).toBe("qux")
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toBe("qux")
      expect(control.dirty.value).toBe(false)
    })

    it("should handle undefined initial values", () => {
      const formState = ref()
      const defaultFormState = ref()
      const control = createInputControl(formState, defaultFormState)

      expect(control.state.value).toBe(undefined)
      expect(control.defaultValue.value).toBe(undefined)
      expect(control.dirty.value).toBe(false)

      control.state.value = "something"
      expect(control.state.value).toBe("something")
      expect(control.dirty.value).toBe(true)
    })
  })

  describe("When state is an object", () => {
    it("should expose the correct initial state and defaultValue", () => {
      const formState = ref({ name: "John", age: 30 })
      const defaultFormState = ref({ name: "John", age: 30 })
      const control = createInputControl(formState, defaultFormState)

      expect(control.state.value).toEqual({ name: "John", age: 30 })
      expect(control.defaultValue.value).toEqual({ name: "John", age: 30 })
      expect(control.dirty.value).toBe(false)
    })

    it("should handle state changes and dirty detection", () => {
      const formState = ref({ name: "John", age: 30 })
      const defaultFormState = ref({ name: "John", age: 30 })
      const control = createInputControl(formState, defaultFormState)

      control.state.value = { name: "Jane", age: 25 }
      expect(control.state.value).toEqual({ name: "Jane", age: 25 })
      expect(control.dirty.value).toBe(true)
    })

    it("should reset to default value and clear dirty state", () => {
      const formState = ref({ name: "John", age: 30 })
      const defaultFormState = ref({ name: "John", age: 30 })
      const control = createInputControl(formState, defaultFormState)

      control.state.value = { name: "Jane", age: 25 }
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toEqual({ name: "John", age: 30 })
      expect(control.dirty.value).toBe(false)
    })

    it("should clear the value and set dirty to true", () => {
      const formState = ref({ name: "John", age: 30 })
      const defaultFormState = ref({ name: "John", age: 30 })
      const control = createInputControl(formState, defaultFormState)

      control.clear()
      expect(control.state.value).toBe(undefined)
      expect(control.dirty.value).toBe(true)
    })

    it("should update the default value", () => {
      const formState = ref({ name: "John", age: 30 })
      const defaultFormState = ref({ name: "John", age: 30 })
      const control = createInputControl(formState, defaultFormState)

      const newDefault = { name: "Bob", age: 40 }
      control.updateDefaultValue(newDefault)
      expect(control.defaultValue.value).toEqual(newDefault)
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toEqual(newDefault)
      expect(control.dirty.value).toBe(false)
    })

    it("should handle nested objects", () => {
      const formState = ref({
        user: { profile: { name: "John" } }
      })
      const defaultFormState = ref({
        user: { profile: { name: "John" } }
      })
      const control = createInputControl(formState, defaultFormState, [
        "user",
        "profile",
        "name"
      ])

      expect(control.state.value).toBe("John")
      expect(control.dirty.value).toBe(false)

      control.state.value = "Jane"
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toBe("John")
      expect(control.dirty.value).toBe(false)
    })

    it("should handle deeply nested object changes", () => {
      const formState = ref({
        level1: { level2: { value: 42 } }
      })
      const defaultFormState = ref({
        level1: { level2: { value: 42 } }
      })
      const control = createInputControl(formState, defaultFormState)

      control.state.value = { level1: { level2: { value: 100 } } }
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toEqual({ level1: { level2: { value: 42 } } })
      expect(control.dirty.value).toBe(false)
    })

    it("should handle arrays nested in object state", () => {
      const formState = ref({
        user: {
          name: "John",
          hobbies: ["reading", "swimming"]
        }
      })
      const defaultFormState = ref({
        user: {
          name: "John",
          hobbies: ["reading", "swimming"]
        }
      })
      const control = createInputControl(formState, defaultFormState, [
        "user",
        "hobbies"
      ])

      expect(control.state.value).toEqual(["reading", "swimming"])
      expect(control.dirty.value).toBe(false)

      control.state.value = ["reading", "cycling"]
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toEqual(["reading", "swimming"])
      expect(control.dirty.value).toBe(false)
    })
  })

  describe("When state is an array", () => {
    it("should expose the correct initial state and defaultValue", () => {
      const formState = ref([1, 2, 3])
      const defaultFormState = ref([1, 2, 3])
      const control = createInputControl(formState, defaultFormState, [])

      expect(control.state.value).toEqual([1, 2, 3])
      expect(control.defaultValue.value).toEqual([1, 2, 3])
      expect(control.dirty.value).toBe(false)
    })

    it("should handle state changes and dirty detection", () => {
      const formState = ref([1, 2, 3])
      const defaultFormState = ref([1, 2, 3])
      const control = createInputControl(formState, defaultFormState, [])

      control.state.value = [1, 2, 4]
      expect(control.state.value).toEqual([1, 2, 4])
      expect(control.dirty.value).toBe(true)
    })

    it("should reset to default value and clear dirty state", () => {
      const formState = ref([1, 2, 3])
      const defaultFormState = ref([1, 2, 3])
      const control = createInputControl(formState, defaultFormState, [])

      control.state.value = [1, 2, 4]
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toEqual([1, 2, 3])
      expect(control.dirty.value).toBe(false)
    })

    it("should clear the value and set dirty to true", () => {
      const formState = ref([1, 2, 3])
      const defaultFormState = ref([1, 2, 3])
      const control = createInputControl(formState, defaultFormState, [])

      control.clear()
      expect(control.state.value).toBe(undefined)
      expect(control.dirty.value).toBe(true)
    })

    it("should update the default value", () => {
      const formState = ref([1, 2, 3])
      const defaultFormState = ref([1, 2, 3])
      const control = createInputControl(formState, defaultFormState, [])

      const newDefault = [4, 5, 6]
      control.updateDefaultValue(newDefault)
      expect(control.defaultValue.value).toEqual(newDefault)
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toEqual(newDefault)
      expect(control.dirty.value).toBe(false)
    })

    it("should handle array element access", () => {
      const formState = ref([1, 2, 3])
      const defaultFormState = ref([1, 2, 3])
      const control = createInputControl(formState, defaultFormState, [0])

      expect(control.state.value).toBe(1)
      expect(control.defaultValue.value).toBe(1)
      expect(control.dirty.value).toBe(false)

      control.state.value = 5
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toBe(1)
      expect(control.dirty.value).toBe(false)

      control.clear()
      expect(control.state.value).toBe(undefined)
      expect(control.dirty.value).toBe(true)
    })

    it("should handle nested arrays", () => {
      const formState = ref([
        [1, 2],
        [3, 4]
      ])
      const defaultFormState = ref([
        [1, 2],
        [3, 4]
      ])
      const control = createInputControl(formState, defaultFormState, [])

      expect(control.state.value).toEqual([
        [1, 2],
        [3, 4]
      ])
      expect(control.dirty.value).toBe(false)

      control.state.value = [
        [1, 2],
        [3, 5]
      ]
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toEqual([
        [1, 2],
        [3, 4]
      ])
      expect(control.dirty.value).toBe(false)
    })

    it("should handle nested array element access", () => {
      const formState = ref([
        [1, 2],
        [3, 4]
      ])
      const defaultFormState = ref([
        [1, 2],
        [3, 4]
      ])
      const control = createInputControl(formState, defaultFormState, [1, 0])

      expect(control.state.value).toBe(3)
      expect(control.defaultValue.value).toBe(3)
      expect(control.dirty.value).toBe(false)

      control.state.value = 7
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toBe(3)
      expect(control.dirty.value).toBe(false)
    })

    it("should handle array of objects", () => {
      const formState = ref([{ a: 1 }, { a: 2 }])
      const defaultFormState = ref([{ a: 1 }, { a: 2 }])
      const control = createInputControl(formState, defaultFormState, [])

      expect(control.state.value).toEqual([{ a: 1 }, { a: 2 }])
      expect(control.dirty.value).toBe(false)

      control.state.value = [{ a: 1 }, { a: 3 }]
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toEqual([{ a: 1 }, { a: 2 }])
      expect(control.dirty.value).toBe(false)
    })

    it("should handle object property within array", () => {
      const formState = ref([{ a: 1 }, { a: 2 }])
      const defaultFormState = ref([{ a: 1 }, { a: 2 }])
      const control = createInputControl(formState, defaultFormState, [1, "a"])

      expect(control.state.value).toBe(2)
      expect(control.defaultValue.value).toBe(2)
      expect(control.dirty.value).toBe(false)

      control.state.value = 5
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toBe(2)
      expect(control.dirty.value).toBe(false)
    })
  })
})
