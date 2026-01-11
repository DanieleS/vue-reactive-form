import { describe, it, expect } from "vitest"
import { createInputControl } from "../inputControl"
import { useFormContext } from "../useFormContext"

describe("createInputControl", () => {
  describe("When state is a primitive", () => {
    it("should expose the correct initial state and defaultValue", () => {
      const context = useFormContext("bar")
      const control = createInputControl(context)

      expect(control.state.value).toBe("bar")
      expect(control.defaultState.value).toBe("bar")
      expect(control.dirty.value).toBe(false)
    })

    it("should handle state changes and dirty detection", () => {
      const context = useFormContext("bar")
      const control = createInputControl(context)

      control.state.value = "baz"
      expect(control.state.value).toBe("baz")
      expect(control.dirty.value).toBe(true)
    })

    it("should reset to default value and clear dirty state", () => {
      const context = useFormContext("bar")
      const { setFieldState } = context
      setFieldState([], "baz", "current")
      const control = createInputControl(context)

      control.state.value = "baz"
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toBe("bar")
      expect(control.dirty.value).toBe(false)
    })

    it("should clear the value and set dirty to true", () => {
      const context = useFormContext("bar")
      const control = createInputControl(context)

      control.clear()
      expect(control.state.value).toBe(undefined)
      expect(control.dirty.value).toBe(true)
    })

    it("should update the default value", () => {
      const context = useFormContext("bar")
      const control = createInputControl(context)

      control.updateDefaultState("qux")
      expect(control.defaultState.value).toBe("qux")
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toBe("qux")
      expect(control.dirty.value).toBe(false)
    })

    it("should handle undefined initial values", () => {
      const context = useFormContext(undefined)

      const control = createInputControl(context)

      expect(control.state.value).toBe(undefined)
      expect(control.defaultState.value).toBe(undefined)
      expect(control.dirty.value).toBe(false)

      control.state.value = "something"
      expect(control.state.value).toBe("something")
      expect(control.dirty.value).toBe(true)
    })

    it("should handle setting default state to undefined", () => {
      const context = useFormContext("bar")
      const control = createInputControl(context)

      expect(control.dirty.value).toBe(false)

      control.updateDefaultState(undefined)
      expect(control.defaultState.value).toBe(undefined)
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toBe(undefined)
      expect(control.dirty.value).toBe(false)
    })

    describe("validation properties", () => {
      it("should report isValid as true when there are no errors", () => {
        const context = useFormContext("valid value")
        const control = createInputControl(context)

        expect(control.isValid.value).toBe(true)
        expect(control.errorMessage.value).toBe(undefined)
      })

      it("should report isValid as false when there are errors", () => {
        const context = useFormContext("invalid value")
        const { errors } = context
        errors.value = {
          "": [
            { message: "Value is required", path: [] },
            {
              message: "Value must be at least 3 characters",

              path: []
            }
          ]
        }
        const control = createInputControl(context)

        expect(control.isValid.value).toBe(false)
        expect(control.errorMessage.value).toBe("Value is required")
      })

      it("should react to changes in the errors state", () => {
        const context = useFormContext("some value")
        const { errors } = context
        const control = createInputControl(context)

        expect(control.isValid.value).toBe(true)
        expect(control.errorMessage.value).toBe(undefined)

        // Add errors - for root level control, errors are stored with empty string key
        errors.value = {
          "": [{ message: "This field is invalid", path: [] }]
        }

        expect(control.isValid.value).toBe(false)
        expect(control.errorMessage.value).toBe("This field is invalid")

        // Clear errors
        errors.value = {}

        expect(control.isValid.value).toBe(true)
        expect(control.errorMessage.value).toBe(undefined)
      })

      it("should clear error messages when updating the state", () => {
        const context = useFormContext("some value")
        const { setFieldErrors } = context
        const control = createInputControl(context)

        setFieldErrors([], [{ message: "Some error", path: [] }])

        expect(control.isValid.value).toBe(false)
        expect(control.errorMessage.value).toBe("Some error")

        control.state.value = "new value"

        expect(control.isValid.value).toBe(true)
        expect(control.errorMessage.value).toBe(undefined)
      })

      it("should handle empty errors object gracefully", () => {
        const context = useFormContext("some value")

        const control = createInputControl(context)

        expect(control.isValid.value).toBe(true)
        expect(control.errorMessage.value).toBe(undefined)
      })

      it("should handle empty error arrays", () => {
        const context = useFormContext("some value")
        const { errors } = context
        errors.value = { "": [] }
        const control = createInputControl(context)

        expect(control.isValid.value).toBe(true)
        expect(control.errorMessage.value).toBe(undefined)
      })
    })
  })

  describe("When state is an object", () => {
    it("should expose the correct initial state and defaultValue", () => {
      const context = useFormContext({ name: "John", age: 30 })
      const control = createInputControl(context)

      expect(control.state.value).toEqual({ name: "John", age: 30 })
      expect(control.defaultState.value).toEqual({ name: "John", age: 30 })
      expect(control.dirty.value).toBe(false)
    })

    it("should handle state changes and dirty detection", () => {
      const context = useFormContext({ name: "John", age: 30 })
      const control = createInputControl(context)

      control.state.value = { name: "Jane", age: 25 }
      expect(control.state.value).toEqual({ name: "Jane", age: 25 })
      expect(control.dirty.value).toBe(true)
    })

    it("should handle state overrides with partial objects, deleting all properties not passed in the new state", () => {
      const context = useFormContext({ name: "John", age: 30 })
      const control = createInputControl(context)

      control.state.value = { name: "Jane" }
      expect(control.state.value).toEqual({ name: "Jane" })
      expect(control.dirty.value).toBe(true)
    })

    it("should reset to default value and clear dirty state", () => {
      const context = useFormContext({ name: "John", age: 30 })
      const control = createInputControl(context)

      control.state.value = { name: "Jane", age: 25 }
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toEqual({ name: "John", age: 30 })
      expect(control.dirty.value).toBe(false)
    })

    it("should clear the value and set dirty to true", () => {
      const context = useFormContext({ name: "John", age: 30 })
      const control = createInputControl(context)

      control.clear()
      expect(control.state.value).toBe(undefined)
      expect(control.dirty.value).toBe(true)
    })

    it("should update the default value", () => {
      const context = useFormContext({ name: "John", age: 30 })
      const control = createInputControl(context)

      const newDefault = { name: "Bob", age: 40 }
      control.updateDefaultState(newDefault)
      expect(control.defaultState.value).toEqual(newDefault)
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toEqual(newDefault)
      expect(control.dirty.value).toBe(false)
    })

    it("should handle nested objects", () => {
      const context = useFormContext({
        user: { profile: { name: "John" } }
      })

      const control = createInputControl(context, ["user", "profile", "name"])

      expect(control.state.value).toBe("John")
      expect(control.dirty.value).toBe(false)

      control.state.value = "Jane"
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toBe("John")
      expect(control.dirty.value).toBe(false)
    })

    it("should handle deeply nested object changes", () => {
      const context = useFormContext({
        level1: { level2: { value: 42 } }
      })

      const control = createInputControl(context)

      control.state.value = { level1: { level2: { value: 100 } } }
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toEqual({ level1: { level2: { value: 42 } } })
      expect(control.dirty.value).toBe(false)
    })

    it("should handle arrays nested in object state", () => {
      const context = useFormContext({
        user: {
          name: "John",
          hobbies: ["reading", "swimming"]
        }
      })

      const control = createInputControl(context, ["user", "hobbies"])

      expect(control.state.value).toEqual(["reading", "swimming"])
      expect(control.dirty.value).toBe(false)

      control.state.value = ["reading", "cycling"]
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toEqual(["reading", "swimming"])
      expect(control.dirty.value).toBe(false)
    })

    it("should handle setting default state to undefined", () => {
      const context = useFormContext({ name: "John", age: 30 })

      const control = createInputControl(context)

      expect(control.dirty.value).toBe(false)

      control.updateDefaultState(undefined)
      expect(control.defaultState.value).toBe(undefined)
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toBe(undefined)
      expect(control.dirty.value).toBe(false)
    })

    describe("validation properties for object paths", () => {
      it("should report isValid based on nested field errors", () => {
        const context = useFormContext({ name: "John", age: 30 })
        const { errors } = context
        errors.value = {
          name: [{ message: "Name is required", path: ["name"] }]
        }
        const nameControl = createInputControl(context, ["name"])

        expect(nameControl.isValid.value).toBe(false)
        expect(nameControl.errorMessage.value).toBe("Name is required")

        // Age field should be valid since it has no errors
        const ageControl = createInputControl(context, ["age"])
        expect(ageControl.isValid.value).toBe(true)
        expect(ageControl.errorMessage.value).toBe(undefined)
      })

      it("should handle deeply nested field validation", () => {
        const context = useFormContext({
          user: {
            profile: {
              name: "John",
              contact: { email: "john@example.com" }
            }
          }
        })
        const { errors } = context
        errors.value = {
          "user.profile.contact.email": [
            {
              message: "Invalid email format",

              path: ["user", "profile", "contact", "email"]
            }
          ]
        }

        const emailControl = createInputControl(context, [
          "user",
          "profile",
          "contact",
          "email"
        ])

        expect(emailControl.isValid.value).toBe(false)
        expect(emailControl.errorMessage.value).toBe("Invalid email format")

        // Name field should be valid
        const nameControl = createInputControl(context, [
          "user",
          "profile",
          "name"
        ])
        expect(nameControl.isValid.value).toBe(true)
        expect(nameControl.errorMessage.value).toBe(undefined)
      })

      it("should react to changes in nested errors", () => {
        const context = useFormContext({ user: { name: "John" } })
        const { errors } = context
        const nameControl = createInputControl(context, ["user", "name"])

        expect(nameControl.isValid.value).toBe(true)
        expect(nameControl.errorMessage.value).toBe(undefined)

        // Add error for nested field
        errors.value = {
          "user.name": [
            {
              message: "Name must be longer",

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
      const context = useFormContext([1, 2, 3])
      const control = createInputControl(context)

      expect(control.state.value).toEqual([1, 2, 3])
      expect(control.defaultState.value).toEqual([1, 2, 3])
      expect(control.dirty.value).toBe(false)
    })

    it("should handle state changes and dirty detection", () => {
      const context = useFormContext([1, 2, 3])
      const control = createInputControl(context)

      control.state.value = [1, 2, 4]
      expect(control.state.value).toEqual([1, 2, 4])
      expect(control.dirty.value).toBe(true)
    })

    it("should reset to default value and clear dirty state", () => {
      const context = useFormContext([1, 2, 3])
      const control = createInputControl(context)

      control.state.value = [1, 2, 4]
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toEqual([1, 2, 3])
      expect(control.dirty.value).toBe(false)
    })

    it("should clear the value and set dirty to true", () => {
      const context = useFormContext([1, 2, 3])
      const control = createInputControl(context)

      control.clear()
      expect(control.state.value).toBe(undefined)
      expect(control.dirty.value).toBe(true)
    })

    it("should update the default value", () => {
      const context = useFormContext([1, 2, 3])
      const control = createInputControl(context)

      const newDefault = [4, 5, 6]
      control.updateDefaultState(newDefault)
      expect(control.defaultState.value).toEqual(newDefault)
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toEqual(newDefault)
      expect(control.dirty.value).toBe(false)
    })

    it("should handle array element access", () => {
      const context = useFormContext([1, 2, 3])
      const control = createInputControl(context, [0])

      expect(control.state.value).toBe(1)
      expect(control.defaultState.value).toBe(1)
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
      const context = useFormContext([
        [1, 2],
        [3, 4]
      ])

      const control = createInputControl(context)

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
      const context = useFormContext([
        [1, 2],
        [3, 4]
      ])

      const control = createInputControl(context, [1, 0])

      expect(control.state.value).toBe(3)
      expect(control.defaultState.value).toBe(3)
      expect(control.dirty.value).toBe(false)

      control.state.value = 7
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toBe(3)
      expect(control.dirty.value).toBe(false)
    })

    it("should handle array of objects", () => {
      const context = useFormContext([{ a: 1 }, { a: 2 }])
      const control = createInputControl(context)

      expect(control.state.value).toEqual([{ a: 1 }, { a: 2 }])
      expect(control.dirty.value).toBe(false)

      control.state.value = [{ a: 1 }, { a: 3 }]
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toEqual([{ a: 1 }, { a: 2 }])
      expect(control.dirty.value).toBe(false)
    })

    it("should handle object property within array", () => {
      const context = useFormContext([{ a: 1 }, { a: 2 }])
      const control = createInputControl(context, [1, "a"])

      expect(control.state.value).toBe(2)
      expect(control.defaultState.value).toBe(2)
      expect(control.dirty.value).toBe(false)

      control.state.value = 5
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toBe(2)
      expect(control.dirty.value).toBe(false)
    })

    it("should handle setting default state to undefined", () => {
      const context = useFormContext([1, 2, 3])
      const control = createInputControl(context)

      expect(control.dirty.value).toBe(false)

      control.updateDefaultState(undefined)
      expect(control.defaultState.value).toBe(undefined)
      expect(control.dirty.value).toBe(true)

      control.reset()
      expect(control.state.value).toBe(undefined)
      expect(control.dirty.value).toBe(false)
    })

    describe("validation properties for array paths", () => {
      it("should report isValid based on array item errors", () => {
        const context = useFormContext(["apple", "banana", "cherry"])
        const { errors } = context
        errors.value = {
          "1": [{ message: "Item at index 1 is invalid", path: [1] }]
        }

        // First item should be valid
        const firstItemControl = createInputControl(context, [0])
        expect(firstItemControl.isValid.value).toBe(true)
        expect(firstItemControl.errorMessage.value).toBe(undefined)

        // Second item should be invalid
        const secondItemControl = createInputControl(context, [1])
        expect(secondItemControl.isValid.value).toBe(false)
        expect(secondItemControl.errorMessage.value).toBe(
          "Item at index 1 is invalid"
        )
      })

      it("should handle validation for nested objects in arrays", () => {
        const context = useFormContext([
          { name: "John", age: 30 },
          { name: "Jane", age: 25 }
        ])
        const { errors } = context
        errors.value = {
          "0.name": [
            {
              message: "Name at index 0 is required",

              path: [0, "name"]
            }
          ],
          "1.age": [
            {
              message: "Age at index 1 must be positive",

              path: [1, "age"]
            }
          ]
        }

        // First item's name should be invalid
        const firstNameControl = createInputControl(context, [0, "name"])
        expect(firstNameControl.isValid.value).toBe(false)
        expect(firstNameControl.errorMessage.value).toBe(
          "Name at index 0 is required"
        )

        // First item's age should be valid
        const firstAgeControl = createInputControl(context, [0, "age"])
        expect(firstAgeControl.isValid.value).toBe(true)
        expect(firstAgeControl.errorMessage.value).toBe(undefined)

        // Second item's age should be invalid
        const secondAgeControl = createInputControl(context, [1, "age"])
        expect(secondAgeControl.isValid.value).toBe(false)
        expect(secondAgeControl.errorMessage.value).toBe(
          "Age at index 1 must be positive"
        )
      })

      it("should react to changes in array item errors", () => {
        const context = useFormContext(["item1", "item2", "item3"])
        const { errors } = context
        const middleItemControl = createInputControl(context, [1])

        expect(middleItemControl.isValid.value).toBe(true)
        expect(middleItemControl.errorMessage.value).toBe(undefined)

        // Add error for middle item
        errors.value = {
          "1": [{ message: "Middle item is invalid", path: [1] }]
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
        const context = useFormContext([{ name: "", age: -5 }])
        const { errors } = context
        errors.value = {
          "0.name": [
            {
              message: "Name is required",

              path: [0, "name"]
            },
            {
              message: "Name must be at least 2 characters",

              path: [0, "name"]
            }
          ]
        }

        const nameControl = createInputControl(context, [0, "name"])
        expect(nameControl.isValid.value).toBe(false)
        expect(nameControl.errorMessage.value).toBe("Name is required") // Should return first error
      })
    })
  })
})
