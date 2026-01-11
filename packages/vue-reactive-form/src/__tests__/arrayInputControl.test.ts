import { describe, it, expect } from "vitest"
import { ref } from "@vue/reactivity"
import { createArrayInputControl } from "../arrayInputControl"

describe("createArrayInputControl", () => {
  describe("add method", () => {
    it("should add an item with a default value to the array", () => {
      const formState = ref([1, 2, 3])
      const defaultFormState = ref([1, 2, 3])
      const errors = ref({})
      const controlsCache = new Map()
      const control = createArrayInputControl({
        state: formState,
        defaultFormState,
        errors,
        controlsCache
      })

      control.add(4)
      expect(control.state.value).toEqual([1, 2, 3, 4])
      expect(control.dirty.value).toBe(true)
    })

    it("should add an item without a default value (undefined) to the array", () => {
      const formState = ref([1, 2, 3])
      const defaultFormState = ref([1, 2, 3])
      const errors = ref({})
      const controlsCache = new Map()
      const control = createArrayInputControl({
        state: formState,
        defaultFormState,
        errors,
        controlsCache
      })

      control.add()
      expect(control.state.value).toEqual([1, 2, 3, undefined])
      expect(control.dirty.value).toBe(true)
    })

    it("should add objects to an array", () => {
      const formState = ref([{ name: "John" }, { name: "Jane" }])
      const defaultFormState = ref([{ name: "John" }, { name: "Jane" }])
      const errors = ref({})
      const controlsCache = new Map()
      const control = createArrayInputControl({
        state: formState,
        defaultFormState,
        errors,
        controlsCache
      })

      control.add({ name: "Bob" })
      expect(control.state.value).toEqual([
        { name: "John" },
        { name: "Jane" },
        { name: "Bob" }
      ])
      expect(control.dirty.value).toBe(true)
    })

    it("should add empty object to an array", () => {
      const formState = ref([{ name: "John" }, { name: "Jane" }])
      const defaultFormState = ref([{ name: "John" }, { name: "Jane" }])
      const errors = ref({})
      const controlsCache = new Map()
      const control = createArrayInputControl({
        state: formState,
        defaultFormState,
        errors,
        controlsCache
      })

      control.add({})
      expect(control.state.value).toEqual([
        { name: "John" },
        { name: "Jane" },
        {}
      ])
      expect(control.dirty.value).toBe(true)
    })

    it("should handle adding to an empty array", () => {
      const formState = ref([])
      const defaultFormState = ref([])
      const errors = ref({})
      const controlsCache = new Map()
      const control = createArrayInputControl({
        state: formState,
        defaultFormState,
        errors,
        controlsCache
      })

      control.add("first item")
      expect(control.state.value).toEqual(["first item"])
      expect(control.dirty.value).toBe(true)
    })

    it("should handle adding when state is undefined", () => {
      const formState = ref(undefined)
      const defaultFormState = ref([])
      const errors = ref({})
      const controlsCache = new Map()
      const control = createArrayInputControl({
        state: formState,
        defaultFormState,
        errors,
        controlsCache
      })

      control.add("item")
      expect(control.state.value).toEqual(["item"])
    })
  })

  describe("remove method", () => {
    it("should remove an item at the specified index", () => {
      const formState = ref([1, 2, 3, 4])
      const defaultFormState = ref([1, 2, 3, 4])
      const errors = ref({})
      const controlsCache = new Map()
      const control = createArrayInputControl({
        state: formState,
        defaultFormState,
        errors,
        controlsCache
      })

      control.remove(1) // Remove element at index 1 (value 2)
      expect(control.state.value).toEqual([1, 3, 4])
      expect(control.dirty.value).toBe(true)
    })

    it("should remove the first item", () => {
      const formState = ref(["a", "b", "c"])
      const defaultFormState = ref(["a", "b", "c"])
      const errors = ref({})
      const controlsCache = new Map()
      const control = createArrayInputControl({
        state: formState,
        defaultFormState,
        errors,
        controlsCache
      })

      control.remove(0)
      expect(control.state.value).toEqual(["b", "c"])
      expect(control.dirty.value).toBe(true)
    })

    it("should remove the last item", () => {
      const formState = ref(["a", "b", "c"])
      const defaultFormState = ref(["a", "b", "c"])
      const errors = ref({})
      const controlsCache = new Map()
      const control = createArrayInputControl({
        state: formState,
        defaultFormState,
        errors,
        controlsCache
      })

      control.remove(2)
      expect(control.state.value).toEqual(["a", "b"])
      expect(control.dirty.value).toBe(true)
    })

    it("should remove objects from an array", () => {
      const formState = ref([
        { id: 1, name: "John" },
        { id: 2, name: "Jane" },
        { id: 3, name: "Bob" }
      ])
      const defaultFormState = ref([
        { id: 1, name: "John" },
        { id: 2, name: "Jane" },
        { id: 3, name: "Bob" }
      ])
      const errors = ref({})
      const controlsCache = new Map()
      const control = createArrayInputControl({
        state: formState,
        defaultFormState,
        errors,
        controlsCache
      })

      control.remove(1) // Remove Jane
      expect(control.state.value).toEqual([
        { id: 1, name: "John" },
        { id: 3, name: "Bob" }
      ])
      expect(control.dirty.value).toBe(true)
    })

    it("should handle removing from a single-item array", () => {
      const formState = ref(["only item"])
      const defaultFormState = ref(["only item"])
      const errors = ref({})
      const controlsCache = new Map()
      const control = createArrayInputControl({
        state: formState,
        defaultFormState,
        errors,
        controlsCache
      })

      control.remove(0)
      expect(control.state.value).toEqual([])
      expect(control.dirty.value).toBe(true)
    })

    it("should handle removing when state is undefined", () => {
      const formState = ref(undefined)
      const defaultFormState = ref([])
      const errors = ref({})
      const controlsCache = new Map()
      const control = createArrayInputControl({
        state: formState,
        defaultFormState,
        errors,
        controlsCache
      })

      // Should not throw an error
      control.remove(0)
      expect(control.state.value).toBe(undefined)
    })
  })

  describe("moveItem method", () => {
    it("should move an item from one index to another", () => {
      const formState = ref(["a", "b", "c", "d"])
      const defaultFormState = ref(["a", "b", "c", "d"])
      const errors = ref({})
      const controlsCache = new Map()
      const control = createArrayInputControl({
        state: formState,
        defaultFormState,
        errors,
        controlsCache
      })

      control.moveItem(0, 2) // Move "a" from index 0 to index 2
      expect(control.state.value).toEqual(["b", "c", "a", "d"])
      expect(control.dirty.value).toBe(true)
    })

    it("should move an item forward in the array", () => {
      const formState = ref([1, 2, 3, 4, 5])
      const defaultFormState = ref([1, 2, 3, 4, 5])
      const errors = ref({})
      const controlsCache = new Map()
      const control = createArrayInputControl({
        state: formState,
        defaultFormState,
        errors,
        controlsCache
      })

      control.moveItem(1, 3) // Move element at index 1 to index 3
      expect(control.state.value).toEqual([1, 3, 4, 2, 5])
      expect(control.dirty.value).toBe(true)
    })

    it("should move an item backward in the array", () => {
      const formState = ref([1, 2, 3, 4, 5])
      const defaultFormState = ref([1, 2, 3, 4, 5])
      const errors = ref({})
      const controlsCache = new Map()
      const control = createArrayInputControl({
        state: formState,
        defaultFormState,
        errors,
        controlsCache
      })

      control.moveItem(3, 1) // Move element at index 3 to index 1
      expect(control.state.value).toEqual([1, 4, 2, 3, 5])
      expect(control.dirty.value).toBe(true)
    })

    it("should handle moving to the same index (no change)", () => {
      const formState = ref(["a", "b", "c"])
      const defaultFormState = ref(["a", "b", "c"])
      const errors = ref({})
      const controlsCache = new Map()
      const control = createArrayInputControl({
        state: formState,
        defaultFormState,
        errors,
        controlsCache
      })

      control.moveItem(1, 1) // Move item at index 1 to index 1
      expect(control.state.value).toEqual(["a", "b", "c"])
      expect(control.dirty.value).toBe(false)
    })

    it("should move objects in an array", () => {
      const formState = ref([
        { id: 1, name: "John" },
        { id: 2, name: "Jane" },
        { id: 3, name: "Bob" }
      ])
      const defaultFormState = ref([
        { id: 1, name: "John" },
        { id: 2, name: "Jane" },
        { id: 3, name: "Bob" }
      ])
      const errors = ref({})
      const controlsCache = new Map()
      const control = createArrayInputControl({
        state: formState,
        defaultFormState,
        errors,
        controlsCache
      })

      control.moveItem(0, 2) // Move John from first to last position
      expect(control.state.value).toEqual([
        { id: 2, name: "Jane" },
        { id: 3, name: "Bob" },
        { id: 1, name: "John" }
      ])
      expect(control.dirty.value).toBe(true)
    })

    it("should clamp indices to array bounds", () => {
      const formState = ref(["a", "b", "c"])
      const defaultFormState = ref(["a", "b", "c"])
      const errors = ref({})
      const controlsCache = new Map()
      const control = createArrayInputControl({
        state: formState,
        defaultFormState,
        errors,
        controlsCache
      })

      // Move with out-of-bounds indices should be clamped
      control.moveItem(-1, 10) // Should clamp to valid indices
      // The exact behavior depends on the implementation, but should not throw
      expect(Array.isArray(control.state.value)).toBe(true)
      expect(control.state.value?.length).toBe(3)
    })

    it("should handle moving in a two-element array", () => {
      const formState = ref(["first", "second"])
      const defaultFormState = ref(["first", "second"])
      const errors = ref({})
      const controlsCache = new Map()
      const control = createArrayInputControl({
        state: formState,
        defaultFormState,
        errors,
        controlsCache
      })

      control.moveItem(0, 1) // Swap elements
      expect(control.state.value).toEqual(["second", "first"])
      expect(control.dirty.value).toBe(true)
    })

    it("should handle moving when state is undefined", () => {
      const formState = ref(undefined)
      const defaultFormState = ref([])
      const errors = ref({})
      const controlsCache = new Map()
      const control = createArrayInputControl({
        state: formState,
        defaultFormState,
        errors,
        controlsCache
      })

      // Should not throw an error
      control.moveItem(0, 1)
      expect(control.state.value).toBe(undefined)
    })
  })
})
