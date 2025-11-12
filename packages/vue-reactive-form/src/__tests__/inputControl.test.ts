import { describe, it, expect } from "vitest"
import { ref } from "@vue/reactivity"
import { createInputControl } from "../inputControl"

describe("createInputControl", () => {
  describe("When state is a primitive", () => {
    it("should expose the correct initial state and defaultValue", () => {
      const formState = ref("bar")
      const defaultFormState = ref("bar")
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors)

      expect(control.state.value).toBe("bar")
      expect(control.defaultValue.value).toBe("bar")
      expect(control.dirty.value).toBe(false)
    })

    it("should handle state changes and dirty detection", () => {
      const formState = ref("bar")
      const defaultFormState = ref("bar")
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors)

      control.state.value = "baz"
      expect(control.state.value).toBe("baz")
      expect(control.dirty.value).toBe(true)
    })

    it("should reset to default value and clear dirty state", () => {
      const formState = ref("baz")
      const defaultFormState = ref("bar")
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors)

      control.state.value = "baz"
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toBe("bar")
      expect(control.dirty.value).toBe(false)
    })

    it("should clear the value and set dirty to true", () => {
      const formState = ref("bar")
      const defaultFormState = ref("bar")
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors)

      control.clear()
      expect(control.state.value).toBe(undefined)
      expect(control.dirty.value).toBe(true)
    })

    it("should update the default value", () => {
      const formState = ref("bar")
      const defaultFormState = ref("bar")
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors)

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
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors)

      expect(control.state.value).toBe(undefined)
      expect(control.defaultValue.value).toBe(undefined)
      expect(control.dirty.value).toBe(false)

      control.state.value = "something"
      expect(control.state.value).toBe("something")
      expect(control.dirty.value).toBe(true)
    })

    it("should handle setting default state to undefined", () => {
      const formState = ref("bar")
      const defaultFormState = ref("bar")
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors)

      expect(control.dirty.value).toBe(false)

      control.updateDefaultValue(undefined)
      expect(control.defaultValue.value).toBe(undefined)
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toBe(undefined)
      expect(control.dirty.value).toBe(false)
    })

    describe("validation properties", () => {
      it("should report isValid as true when there are no errors", () => {
        const formState = ref("valid value")
        const defaultFormState = ref("valid value")
        const errors = ref({})
        const control = createInputControl(formState, defaultFormState, errors)

        expect(control.isValid.value).toBe(true)
        expect(control.errorMessage.value).toBe(undefined)
      })

      it("should report isValid as false when there are errors", () => {
        const formState = ref("invalid value")
        const defaultFormState = ref("invalid value")
        const errors = ref({
          "": [
            { message: "Value is required", code: "required", path: [] },
            {
              message: "Value must be at least 3 characters",
              code: "min_length",
              path: []
            }
          ]
        })
        const control = createInputControl(formState, defaultFormState, errors)

        expect(control.isValid.value).toBe(false)
        expect(control.errorMessage.value).toBe("Value is required")
      })

      it("should react to changes in the errors state", () => {
        const formState = ref("some value")
        const defaultFormState = ref("some value")
        const errors = ref({})
        const control = createInputControl(formState, defaultFormState, errors)

        expect(control.isValid.value).toBe(true)
        expect(control.errorMessage.value).toBe(undefined)

        // Add errors - for root level control, errors are stored with empty string key
        errors.value = {
          "": [{ message: "This field is invalid", code: "invalid", path: [] }]
        }

        expect(control.isValid.value).toBe(false)
        expect(control.errorMessage.value).toBe("This field is invalid")

        // Clear errors
        errors.value = {}

        expect(control.isValid.value).toBe(true)
        expect(control.errorMessage.value).toBe(undefined)
      })

      it("should handle empty errors object gracefully", () => {
        const formState = ref("some value")
        const defaultFormState = ref("some value")
        const errors = ref({})
        const control = createInputControl(formState, defaultFormState, errors)

        expect(control.isValid.value).toBe(true)
        expect(control.errorMessage.value).toBe(undefined)
      })

      it("should handle empty error arrays", () => {
        const formState = ref("some value")
        const defaultFormState = ref("some value")
        const errors = ref({ "": [] })
        const control = createInputControl(formState, defaultFormState, errors)

        expect(control.isValid.value).toBe(true)
        expect(control.errorMessage.value).toBe(undefined)
      })
    })
  })

  describe("When state is an object", () => {
    it("should expose the correct initial state and defaultValue", () => {
      const formState = ref({ name: "John", age: 30 })
      const defaultFormState = ref({ name: "John", age: 30 })
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors)

      expect(control.state.value).toEqual({ name: "John", age: 30 })
      expect(control.defaultValue.value).toEqual({ name: "John", age: 30 })
      expect(control.dirty.value).toBe(false)
    })

    it("should handle state changes and dirty detection", () => {
      const formState = ref({ name: "John", age: 30 })
      const defaultFormState = ref({ name: "John", age: 30 })
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors)

      control.state.value = { name: "Jane", age: 25 }
      expect(control.state.value).toEqual({ name: "Jane", age: 25 })
      expect(control.dirty.value).toBe(true)
    })

    it("should handle state overrides with partial objects, deleting all properties not passed in the new state", () => {
      const formState = ref({ name: "John", age: 30 })
      const defaultFormState = ref({ name: "John", age: 30 })
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors)

      control.state.value = { name: "Jane" }
      expect(control.state.value).toEqual({ name: "Jane" })
      expect(control.dirty.value).toBe(true)
    })

    it("should reset to default value and clear dirty state", () => {
      const formState = ref({ name: "John", age: 30 })
      const defaultFormState = ref({ name: "John", age: 30 })
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors)

      control.state.value = { name: "Jane", age: 25 }
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toEqual({ name: "John", age: 30 })
      expect(control.dirty.value).toBe(false)
    })

    it("should clear the value and set dirty to true", () => {
      const formState = ref({ name: "John", age: 30 })
      const defaultFormState = ref({ name: "John", age: 30 })
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors)

      control.clear()
      expect(control.state.value).toBe(undefined)
      expect(control.dirty.value).toBe(true)
    })

    it("should update the default value", () => {
      const formState = ref({ name: "John", age: 30 })
      const defaultFormState = ref({ name: "John", age: 30 })
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors)

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
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors, [
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
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors)

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
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors, [
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

    it("should handle setting default state to undefined", () => {
      const formState = ref({ name: "John", age: 30 })
      const defaultFormState = ref({ name: "John", age: 30 })
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors)

      expect(control.dirty.value).toBe(false)

      control.updateDefaultValue(undefined)
      expect(control.defaultValue.value).toBe(undefined)
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toBe(undefined)
      expect(control.dirty.value).toBe(false)
    })

    describe("validation properties for object paths", () => {
      it("should report isValid based on nested field errors", () => {
        const formState = ref({ name: "John", age: 30 })
        const defaultFormState = ref({ name: "John", age: 30 })
        const errors = ref({
          name: [
            { message: "Name is required", code: "required", path: ["name"] }
          ]
        })
        const nameControl = createInputControl(
          formState,
          defaultFormState,
          errors,
          ["name"]
        )

        expect(nameControl.isValid.value).toBe(false)
        expect(nameControl.errorMessage.value).toBe("Name is required")

        // Age field should be valid since it has no errors
        const ageControl = createInputControl(
          formState,
          defaultFormState,
          errors,
          ["age"]
        )
        expect(ageControl.isValid.value).toBe(true)
        expect(ageControl.errorMessage.value).toBe(undefined)
      })

      it("should handle deeply nested field validation", () => {
        const formState = ref({
          user: {
            profile: {
              name: "John",
              contact: { email: "john@example.com" }
            }
          }
        })
        const defaultFormState = ref({
          user: {
            profile: {
              name: "John",
              contact: { email: "john@example.com" }
            }
          }
        })
        const errors = ref({
          "user.profile.contact.email": [
            {
              message: "Invalid email format",
              code: "invalid_email",
              path: ["user", "profile", "contact", "email"]
            }
          ]
        })

        const emailControl = createInputControl(
          formState,
          defaultFormState,
          errors,
          ["user", "profile", "contact", "email"]
        )

        expect(emailControl.isValid.value).toBe(false)
        expect(emailControl.errorMessage.value).toBe("Invalid email format")

        // Name field should be valid
        const nameControl = createInputControl(
          formState,
          defaultFormState,
          errors,
          ["user", "profile", "name"]
        )
        expect(nameControl.isValid.value).toBe(true)
        expect(nameControl.errorMessage.value).toBe(undefined)
      })

      it("should react to changes in nested errors", () => {
        const formState = ref({ user: { name: "John" } })
        const defaultFormState = ref({ user: { name: "John" } })
        const errors = ref({})
        const nameControl = createInputControl(
          formState,
          defaultFormState,
          errors,
          ["user", "name"]
        )

        expect(nameControl.isValid.value).toBe(true)
        expect(nameControl.errorMessage.value).toBe(undefined)

        // Add error for nested field
        errors.value = {
          "user.name": [
            {
              message: "Name must be longer",
              code: "min_length",
              path: ["user", "name"]
            }
          ]
        }

        expect(nameControl.isValid.value).toBe(false)
        expect(nameControl.errorMessage.value).toBe("Name must be longer")

        // Clear errors
        errors.value = {}

        expect(nameControl.isValid.value).toBe(true)
        expect(nameControl.errorMessage.value).toBe(undefined)
      })
    })
  })

  describe("When state is an array", () => {
    it("should expose the correct initial state and defaultValue", () => {
      const formState = ref([1, 2, 3])
      const defaultFormState = ref([1, 2, 3])
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors)

      expect(control.state.value).toEqual([1, 2, 3])
      expect(control.defaultValue.value).toEqual([1, 2, 3])
      expect(control.dirty.value).toBe(false)
    })

    it("should handle state changes and dirty detection", () => {
      const formState = ref([1, 2, 3])
      const defaultFormState = ref([1, 2, 3])
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors)

      control.state.value = [1, 2, 4]
      expect(control.state.value).toEqual([1, 2, 4])
      expect(control.dirty.value).toBe(true)
    })

    it("should reset to default value and clear dirty state", () => {
      const formState = ref([1, 2, 3])
      const defaultFormState = ref([1, 2, 3])
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors)

      control.state.value = [1, 2, 4]
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toEqual([1, 2, 3])
      expect(control.dirty.value).toBe(false)
    })

    it("should clear the value and set dirty to true", () => {
      const formState = ref([1, 2, 3])
      const defaultFormState = ref([1, 2, 3])
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors)

      control.clear()
      expect(control.state.value).toBe(undefined)
      expect(control.dirty.value).toBe(true)
    })

    it("should update the default value", () => {
      const formState = ref([1, 2, 3])
      const defaultFormState = ref([1, 2, 3])
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors)

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
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors, [
        0
      ])

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
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors)

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
      const errors = ref({})
      const control = createInputControl(
        formState,
        defaultFormState,
        errors,
        [1, 0]
      )

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
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors)

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
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors, [
        1,
        "a"
      ])

      expect(control.state.value).toBe(2)
      expect(control.defaultValue.value).toBe(2)
      expect(control.dirty.value).toBe(false)

      control.state.value = 5
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toBe(2)
      expect(control.dirty.value).toBe(false)
    })

    it("should handle setting default state to undefined", () => {
      const formState = ref([1, 2, 3])
      const defaultFormState = ref([1, 2, 3])
      const errors = ref({})
      const control = createInputControl(formState, defaultFormState, errors)

      expect(control.dirty.value).toBe(false)

      control.updateDefaultValue(undefined)
      expect(control.defaultValue.value).toBe(undefined)
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toBe(undefined)
      expect(control.dirty.value).toBe(false)
    })

    describe("validation properties for array paths", () => {
      it("should report isValid based on array item errors", () => {
        const formState = ref(["apple", "banana", "cherry"])
        const defaultFormState = ref(["apple", "banana", "cherry"])
        const errors = ref({
          "1": [
            {
              message: "Item at index 1 is invalid",
              code: "invalid",
              path: [1]
            }
          ]
        })

        // First item should be valid
        const firstItemControl = createInputControl(
          formState,
          defaultFormState,
          errors,
          [0]
        )
        expect(firstItemControl.isValid.value).toBe(true)
        expect(firstItemControl.errorMessage.value).toBe(undefined)

        // Second item should be invalid
        const secondItemControl = createInputControl(
          formState,
          defaultFormState,
          errors,
          [1]
        )
        expect(secondItemControl.isValid.value).toBe(false)
        expect(secondItemControl.errorMessage.value).toBe(
          "Item at index 1 is invalid"
        )
      })

      it("should handle validation for nested objects in arrays", () => {
        const formState = ref([
          { name: "John", age: 30 },
          { name: "Jane", age: 25 }
        ])
        const defaultFormState = ref([
          { name: "John", age: 30 },
          { name: "Jane", age: 25 }
        ])
        const errors = ref({
          "0.name": [
            {
              message: "Name at index 0 is required",
              code: "required",
              path: [0, "name"]
            }
          ],
          "1.age": [
            {
              message: "Age at index 1 must be positive",
              code: "min",
              path: [1, "age"]
            }
          ]
        })

        // First item's name should be invalid
        const firstNameControl = createInputControl(
          formState,
          defaultFormState,
          errors,
          [0, "name"]
        )
        expect(firstNameControl.isValid.value).toBe(false)
        expect(firstNameControl.errorMessage.value).toBe(
          "Name at index 0 is required"
        )

        // First item's age should be valid
        const firstAgeControl = createInputControl(
          formState,
          defaultFormState,
          errors,
          [0, "age"]
        )
        expect(firstAgeControl.isValid.value).toBe(true)
        expect(firstAgeControl.errorMessage.value).toBe(undefined)

        // Second item's age should be invalid
        const secondAgeControl = createInputControl(
          formState,
          defaultFormState,
          errors,
          [1, "age"]
        )
        expect(secondAgeControl.isValid.value).toBe(false)
        expect(secondAgeControl.errorMessage.value).toBe(
          "Age at index 1 must be positive"
        )
      })

      it("should react to changes in array item errors", () => {
        const formState = ref(["item1", "item2", "item3"])
        const defaultFormState = ref(["item1", "item2", "item3"])
        const errors = ref({})
        const middleItemControl = createInputControl(
          formState,
          defaultFormState,
          errors,
          [1]
        )

        expect(middleItemControl.isValid.value).toBe(true)
        expect(middleItemControl.errorMessage.value).toBe(undefined)

        // Add error for middle item
        errors.value = {
          "1": [
            { message: "Middle item is invalid", code: "invalid", path: [1] }
          ]
        }

        expect(middleItemControl.isValid.value).toBe(false)
        expect(middleItemControl.errorMessage.value).toBe(
          "Middle item is invalid"
        )

        // Clear errors
        errors.value = {}

        expect(middleItemControl.isValid.value).toBe(true)
        expect(middleItemControl.errorMessage.value).toBe(undefined)
      })

      it("should handle multiple errors on the same array item", () => {
        const formState = ref([{ name: "", age: -5 }])
        const defaultFormState = ref([{ name: "", age: -5 }])
        const errors = ref({
          "0.name": [
            {
              message: "Name is required",
              code: "required",
              path: [0, "name"]
            },
            {
              message: "Name must be at least 2 characters",
              code: "min_length",
              path: [0, "name"]
            }
          ]
        })

        const nameControl = createInputControl(
          formState,
          defaultFormState,
          errors,
          [0, "name"]
        )
        expect(nameControl.isValid.value).toBe(false)
        expect(nameControl.errorMessage.value).toBe("Name is required") // Should return first error
      })
    })
  })
})
