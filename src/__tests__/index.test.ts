import { describe, it, expect } from "vitest"
import { useForm } from "../index"
import * as yup from "yup"

describe("useForm", () => {
  describe("Controls tree navigation", () => {
    it("should handle primitive root state", () => {
      const { form } = useForm("Hello World")

      expect(form.$control.state.value).toBe("Hello World")
    })

    it("should handle array root state", () => {
      const { form } = useForm(["Hello World"])

      expect(form.$control.state.value).toEqual(["Hello World"])
    })

    it("should navigate to primitive properties", () => {
      const { form } = useForm({ name: "John", age: 30 })

      expect(form.name.$control.state.value).toBe("John")
      expect(form.age.$control.state.value).toBe(30)
    })

    it("should navigate to nested object properties", () => {
      const { form } = useForm({
        user: {
          profile: {
            name: "John",
            email: "john@example.com"
          }
        }
      })

      expect(form.user.profile.name.$control.state.value).toBe("John")
      expect(form.user.profile.email.$control.state.value).toBe(
        "john@example.com"
      )
    })

    it("should navigate to array properties", () => {
      const { form } = useForm({
        tags: ["javascript", "vue", "typescript"]
      })

      expect(form.tags.$control.state.value).toEqual([
        "javascript",
        "vue",
        "typescript"
      ])
    })

    it("should navigate to array elements", () => {
      const { form } = useForm({
        users: [
          { name: "John", age: 30 },
          { name: "Jane", age: 25 }
        ]
      })

      expect(form.users[0]?.name.$control.state.value).toBe("John")
      expect(form.users[0]?.age.$control.state.value).toBe(30)
      expect(form.users[1]?.name.$control.state.value).toBe("Jane")
      expect(form.users[1]?.age.$control.state.value).toBe(25)
    })

    it("should iterate over array elements", () => {
      const { form } = useForm({
        items: ["a", "b", "c"]
      })

      const values = []
      for (const item of form.items) {
        values.push(item.$control.state.value)
      }

      expect(values).toEqual(["a", "b", "c"])
    })

    it("should handle deeply nested structures", () => {
      const { form } = useForm({
        company: {
          departments: [
            {
              name: "Engineering",
              employees: [
                { name: "John", skills: ["js", "vue"] },
                { name: "Jane", skills: ["python", "django"] }
              ]
            }
          ]
        }
      })

      expect(form.company.departments[0]?.name.$control.state.value).toBe(
        "Engineering"
      )
      expect(
        form.company.departments[0]?.employees[0]?.name.$control.state.value
      ).toBe("John")
      expect(
        form.company.departments[0]?.employees[0]?.skills.$control.state.value
      ).toEqual(["js", "vue"])
      expect(
        form.company.departments[0]?.employees[1]?.skills[1]?.$control.state
          .value
      ).toBe("django")
    })

    it("should maintain the same control reference for the same path", () => {
      const { form } = useForm({ name: "John" })

      const control1 = form.name.$control
      const control2 = form.name.$control

      expect(control1).toBe(control2)
    })

    it("should handle empty objects and arrays", () => {
      const { form } = useForm({
        emptyObject: {},
        emptyArray: []
      })

      expect(form.emptyObject.$control.state.value).toEqual({})
      expect(form.emptyArray.$control.state.value).toEqual([])
    })

    it("should handle undefined properties", () => {
      const { form } = useForm<{ name: string; age: number }>({})

      expect(form.name.$control.state.value).toBe(undefined)
      expect(form.age.$control.state.value).toBe(undefined)
    })

    it("should update state through controls tree navigation", () => {
      const { form } = useForm<{ user: { name: string } }>({
        user: { name: "John" }
      })

      form.user.name.$control.state.value = "Jane"

      expect(form.user.name.$control.state.value).toBe("Jane")
      expect(form.user.name.$control.dirty.value).toBe(true)
    })

    it("should update state in root primitive through controls tree navigation", () => {
      const { form } = useForm("Hello")

      form.$control.state.value = "World"

      expect(form.$control.state.value).toBe("World")
      expect(form.$control.dirty.value).toBe(true)
    })

    it("should update state in root array through controls tree navigation", () => {
      const { form } = useForm<string[]>(["a", "b", "c"])

      form.$control.state.value = ["x", "y", "z"]

      expect(form.$control.state.value).toEqual(["x", "y", "z"])
      expect(form.$control.dirty.value).toBe(true)
    })

    it("should update state in object through controls tree navigation", () => {
      const { form } = useForm<{ user: { name: string } }>({
        user: { name: "John" }
      })

      form.user.name.$control.state.value = "Jane"

      expect(form.user.name.$control.state.value).toBe("Jane")
      expect(form.user.name.$control.dirty.value).toBe(true)

      form.user.$control.state.value = { name: "Alice" }

      expect(form.user.name.$control.state.value).toBe("Alice")
      expect(form.user.name.$control.dirty.value).toBe(true)
    })

    it("should update state in arrays through controls tree navigation", () => {
      const { form } = useForm<{ user: { skills: string[] } }>({
        user: { skills: ["js", "vue"] }
      })

      form.user.skills[0]!.$control.state.value = "react"

      expect(form.user.skills[0]?.$control.state.value).toBe("react")
      expect(form.user.skills[0]?.$control.dirty.value).toBe(true)
    })

    it("should handle mixed data types in complex structures", () => {
      const { form } = useForm({
        id: 1,
        active: true,
        user: {
          name: "John",
          metadata: {
            tags: ["admin", "user"],
            settings: {
              theme: "dark",
              notifications: true
            }
          }
        },
        scores: [85, 92, 78]
      })

      expect(form.id.$control.state.value).toBe(1)
      expect(form.active.$control.state.value).toBe(true)
      expect(form.user.metadata.tags[0]?.$control.state.value).toBe("admin")
      expect(form.user.metadata.settings.theme.$control.state.value).toBe(
        "dark"
      )
      expect(form.scores[1]?.$control.state.value).toBe(92)
    })
  })

  describe("Validation", () => {
    it("should return the form's state when no validation schema is provided", async () => {
      const { validate } = useForm("hello")

      const result = await validate()

      expect(result).toBe("hello")
    })

    it("should validate successfully with a simple schema", async () => {
      const schema = yup.string().required()
      const { validate } = useForm("hello", { validationSchema: schema })

      const result = await validate()

      expect(result).toBe("hello")
    })

    it("should return undefined when validation fails", async () => {
      const schema = yup.string().required()
      const { validate } = useForm("", { validationSchema: schema })

      const result = await validate()

      expect(result).toBe(undefined)
    })

    it("should test control validity state after validation", async () => {
      const schema = yup.string().required("Name is required")
      const { form, validate } = useForm("", { validationSchema: schema })

      // Check initial state
      expect(form.$control.isValid.value).toBe(true)
      expect(form.$control.errorMessage.value).toBe(undefined)

      // Validate and check if control state updates
      const result = await validate()
      expect(result).toBe(undefined)

      // Check if control validity is updated after validation
      expect(form.$control.isValid.value).toBe(false)
      expect(form.$control.errorMessage.value).toBe("Name is required")
    })

    it("should validate object properties correctly", async () => {
      const schema = yup.object({
        name: yup.string().required("Name is required"),
        age: yup
          .number()
          .required("Age is required")
          .min(0, "Age must be positive")
      })
      const { form, validate } = useForm(
        { name: "", age: -5 },
        { validationSchema: schema }
      )

      const result = await validate()
      expect(result).toBe(undefined)

      // Check name field validation
      expect(form.name.$control.isValid.value).toBe(false)
      expect(form.name.$control.errorMessage.value).toBe("Name is required")

      // Check age field validation
      expect(form.age.$control.isValid.value).toBe(false)
      expect(form.age.$control.errorMessage.value).toBe("Age must be positive")
    })

    it("should clear errors when validation succeeds", async () => {
      const schema = yup.string().required("Name is required")
      const { form, validate } = useForm("", { validationSchema: schema })

      // First validation should fail
      let result = await validate()
      expect(result).toBe(undefined)
      expect(form.$control.isValid.value).toBe(false)

      // Fix the value and validate again
      form.$control.state.value = "hello"
      result = await validate()

      expect(result).toBe("hello")
      expect(form.$control.isValid.value).toBe(true)
      expect(form.$control.errorMessage.value).toBe(undefined)
    })

    it("should validate arrays correctly", async () => {
      const schema = yup
        .array()
        .of(yup.string().required("Item is required"))
        .min(1, "At least one item required")
      const { form, validate } = useForm([], { validationSchema: schema })

      const result = await validate()
      expect(result).toBe(undefined)

      // Check array validation
      expect(form.$control.isValid.value).toBe(false)
      expect(form.$control.errorMessage.value).toBe(
        "At least one item required"
      )
    })

    it("should validate nested arrays in objects correctly", async () => {
      const schema = yup.object({
        name: yup.string().required("Name is required"),
        tags: yup
          .array()
          .of(yup.string().required("Tag cannot be empty"))
          .min(1, "At least one tag required")
      })
      const { form, validate } = useForm(
        { name: "John", tags: [] },
        { validationSchema: schema }
      )

      const result = await validate()
      expect(result).toBe(undefined)

      // Check name field (should be valid)
      expect(form.name).toBeDefined()
      expect(form.name.$control.isValid.value).toBe(true)
      expect(form.name.$control.errorMessage.value).toBe(undefined)

      // Check tags array validation
      expect(form.tags).toBeDefined()
      expect(form.tags?.$control.isValid.value).toBe(false)
      expect(form.tags?.$control.errorMessage.value).toBe(
        "At least one tag required"
      )
    })
  })

  describe("Handle Submit", () => {
    it("should call onSuccess when validation passes in handleSubmit", async () => {
      const schema = yup.object({
        name: yup.string().required()
      })
      const { handleSubmit } = useForm(
        { name: "John" },
        { validationSchema: schema }
      )

      const onSuccess = vi.fn()
      const onError = vi.fn()
      const submit = handleSubmit({ onSuccess, onError })

      await submit()

      expect(onSuccess).toHaveBeenCalledWith({ name: "John" })
      expect(onError).not.toHaveBeenCalled()
    })

    it("should call onError when validation fails in handleSubmit", async () => {
      const schema = yup.object({
        name: yup.string().required("Name is required")
      })
      const { handleSubmit, errors } = useForm(
        { name: "" },
        { validationSchema: schema }
      )

      const onSuccess = vi.fn()
      const onError = vi.fn()
      const submit = handleSubmit({ onSuccess, onError })

      await submit()

      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith({
        name: [{ message: "Name is required", path: ["name"] }]
      })
      expect(errors.value.name).toBeDefined()
    })

    it("should call onSuccess with state when no validation schema is provided", async () => {
      const { handleSubmit } = useForm({ foo: "bar" })
      const onSuccess = vi.fn()
      const onError = vi.fn()
      const submit = handleSubmit({ onSuccess, onError })
      await submit()
      expect(onSuccess).toHaveBeenCalledWith({ foo: "bar" })
      expect(onError).not.toHaveBeenCalled()
    })

    it("should call preventDefault on event if passed to submit", async () => {
      const form = useForm({ foo: "bar" })
      const onSuccess = vi.fn()
      const onError = vi.fn()
      const submit = form.handleSubmit({ onSuccess, onError })
      // Use a minimal mock that satisfies the SubmitEvent type
      const event = {
        preventDefault: vi.fn() // only testing preventDefault call
      } as unknown as SubmitEvent

      await submit(event)

      expect(event.preventDefault).toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalledWith({ foo: "bar" })
      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe("validateOn option", () => {
    const schema = yup.object({
      name: yup.string().required("Name is required")
    })

    it("should validate on change by default (validateOn=change)", async () => {
      const { form, errors } = useForm(
        { name: "default value" },
        { validationSchema: schema }
      )
      // Initially valid (before any change)
      expect(errors.value.name).toBeUndefined()

      // Change the value to trigger validation
      form.name.$control.state.value = ""

      await new Promise((r) => setTimeout(r)) // flush async updates

      expect(errors.value.name).toBeDefined()
      expect(
        errors.value.name?.some((issue) => issue.message === "Name is required")
      ).toBe(true)
    })

    it("should not validate on change if validateOn=manual", async () => {
      const { form, validate, errors } = useForm(
        { name: "" },
        { validationSchema: schema, validateOn: "manual" }
      )
      // Change the value
      form.name.$control.state.value = ""

      await new Promise((r) => setTimeout(r)) // flush async updates

      // Should not validate automatically
      expect(errors.value.name).toBeUndefined()

      // Manual validation
      await validate()
      expect(errors.value.name).toBeDefined()
    })

    it("should validate on change if validateOn=change", async () => {
      const { form, errors } = useForm(
        { name: "default value" },
        { validationSchema: schema, validateOn: "change" }
      )
      form.name.$control.state.value = ""

      await new Promise((r) => setTimeout(r)) // flush async updates

      expect(errors.value.name).toBeDefined()
    })

    it("should only validate on submit if validateOn=submit", async () => {
      const { form, errors, handleSubmit } = useForm(
        { name: "default value" },
        { validationSchema: schema, validateOn: "submit" }
      )

      // Change value, should not trigger validation
      form.name.$control.state.value = ""

      await new Promise((r) => setTimeout(r)) // flush async updates

      expect(errors.value.name).toBeUndefined()

      // Now submit
      const onSuccess = vi.fn()
      const onError = vi.fn()
      const submit = handleSubmit({ onSuccess, onError })

      await submit()

      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalled()
      expect(errors.value.name).toBeDefined()
      expect(
        errors.value.name?.some((issue) => issue.message === "Name is required")
      ).toBe(true)
    })
  })
})
