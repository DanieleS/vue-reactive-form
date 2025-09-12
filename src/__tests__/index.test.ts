import { describe, it, expect } from "vitest"
import { useFormControl } from "../index"

describe("useFormControl", () => {
  describe("Controls tree navigation", () => {
    it("should handle primitive root state", () => {
      const form = useFormControl("Hello World")

      expect(form.controlsTree.control.state.value).toBe("Hello World")
    })

    it("should handle array root state", () => {
      const form = useFormControl(["Hello World"])

      expect(form.controlsTree.control.state.value).toEqual(["Hello World"])
    })

    it("should navigate to primitive properties", () => {
      const form = useFormControl({ name: "John", age: 30 })

      expect(form.controlsTree.name.control.state.value).toBe("John")
      expect(form.controlsTree.age.control.state.value).toBe(30)
    })

    it("should navigate to nested object properties", () => {
      const form = useFormControl({
        user: {
          profile: {
            name: "John",
            email: "john@example.com"
          }
        }
      })

      expect(form.controlsTree.user.profile.name.control.state.value).toBe(
        "John"
      )
      expect(form.controlsTree.user.profile.email.control.state.value).toBe(
        "john@example.com"
      )
    })

    it("should navigate to array properties", () => {
      const form = useFormControl({
        tags: ["javascript", "vue", "typescript"]
      })

      expect(form.controlsTree.tags.control.state.value).toEqual([
        "javascript",
        "vue",
        "typescript"
      ])
    })

    it("should navigate to array elements", () => {
      const form = useFormControl({
        users: [
          { name: "John", age: 30 },
          { name: "Jane", age: 25 }
        ]
      })

      expect(form.controlsTree.users[0]?.name.control.state.value).toBe("John")
      expect(form.controlsTree.users[0]?.age.control.state.value).toBe(30)
      expect(form.controlsTree.users[1]?.name.control.state.value).toBe("Jane")
      expect(form.controlsTree.users[1]?.age.control.state.value).toBe(25)
    })

    it("should iterate over array elements", () => {
      const form = useFormControl({
        items: ["a", "b", "c"]
      })

      const values = []
      for (const item of form.controlsTree.items) {
        values.push(item.control.state.value)
      }

      expect(values).toEqual(["a", "b", "c"])
    })

    it("should handle deeply nested structures", () => {
      const form = useFormControl({
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

      expect(
        form.controlsTree.company.departments[0]?.name.control.state.value
      ).toBe("Engineering")
      expect(
        form.controlsTree.company.departments[0]?.employees[0]?.name.control
          .state.value
      ).toBe("John")
      expect(
        form.controlsTree.company.departments[0]?.employees[0]?.skills.control
          .state.value
      ).toEqual(["js", "vue"])
      expect(
        form.controlsTree.company.departments[0]?.employees[1]?.skills[1]
          ?.control.state.value
      ).toBe("django")
    })

    it("should maintain the same control reference for the same path", () => {
      const form = useFormControl({ name: "John" })

      const control1 = form.controlsTree.name.control
      const control2 = form.controlsTree.name.control

      expect(control1).toBe(control2)
    })

    it("should handle empty objects and arrays", () => {
      const form = useFormControl({
        emptyObject: {},
        emptyArray: []
      })

      expect(form.controlsTree.emptyObject.control.state.value).toEqual({})
      expect(form.controlsTree.emptyArray.control.state.value).toEqual([])
    })

    it("should handle undefined properties", () => {
      const form = useFormControl<{ name: string; age: number }>({})

      expect(form.controlsTree.name?.control.state.value).toBe(undefined)
      expect(form.controlsTree.age?.control.state.value).toBe(undefined)
    })

    it("should update state through controls tree navigation", () => {
      const form = useFormControl<{ user: { name: string } }>({
        user: { name: "John" }
      })

      form.controlsTree.user.name.control.state.value = "Jane"

      expect(form.controlsTree.user.name.control.state.value).toBe("Jane")
      expect(form.controlsTree.user.name.control.dirty.value).toBe(true)
    })

    it("should update state in root primitive through controls tree navigation", () => {
      const form = useFormControl("Hello")

      form.controlsTree.control.state.value = "World"

      expect(form.controlsTree.control.state.value).toBe("World")
      expect(form.controlsTree.control.dirty.value).toBe(true)
    })

    it("should update state in root array through controls tree navigation", () => {
      const form = useFormControl<string[]>(["a", "b", "c"])

      form.controlsTree.control.state.value = ["x", "y", "z"]

      expect(form.controlsTree.control.state.value).toEqual(["x", "y", "z"])
      expect(form.controlsTree.control.dirty.value).toBe(true)
    })

    it("should update state in object through controls tree navigation", () => {
      const form = useFormControl<{ user: { name: string } }>({
        user: { name: "John" }
      })

      form.controlsTree.user.name.control.state.value = "Jane"

      expect(form.controlsTree.user.name.control.state.value).toBe("Jane")
      expect(form.controlsTree.user.name.control.dirty.value).toBe(true)

      form.controlsTree.user.control.state.value = { name: "Alice" }

      expect(form.controlsTree.user.name.control.state.value).toBe("Alice")
      expect(form.controlsTree.user.name.control.dirty.value).toBe(true)
    })

    it("should update state in arrays through controls tree navigation", () => {
      const form = useFormControl<{ user: { skills: string[] } }>({
        user: { skills: ["js", "vue"] }
      })

      form.controlsTree.user.skills[0]!.control.state.value = "react"

      expect(form.controlsTree.user.skills[0]?.control.state.value).toBe(
        "react"
      )
      expect(form.controlsTree.user.skills[0]?.control.dirty.value).toBe(true)
    })

    it("should handle mixed data types in complex structures", () => {
      const form = useFormControl({
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

      expect(form.controlsTree.id.control.state.value).toBe(1)
      expect(form.controlsTree.active.control.state.value).toBe(true)
      expect(form.controlsTree.user.metadata.tags[0]?.control.state.value).toBe(
        "admin"
      )
      expect(
        form.controlsTree.user.metadata.settings.theme.control.state.value
      ).toBe("dark")
      expect(form.controlsTree.scores[1]?.control.state.value).toBe(92)
    })
  })

  describe("Array control operations", () => {
    it("should add items to an array using the add method", () => {
      const form = useFormControl<{ tags: string[] }>({
        tags: ["javascript", "vue"]
      })

      form.controlsTree.tags.control.add("typescript")

      expect(form.controlsTree.tags.control.state.value).toEqual([
        "javascript",
        "vue",
        "typescript"
      ])
      expect(form.controlsTree.tags.control.dirty.value).toBe(true)
    })

    it("should remove items from an array using the remove method", () => {
      const form = useFormControl({
        tags: ["javascript", "vue", "typescript"]
      })

      form.controlsTree.tags.control.remove(1)

      expect(form.controlsTree.tags.control.state.value).toEqual([
        "javascript",
        "typescript"
      ])
      expect(form.controlsTree.tags.control.dirty.value).toBe(true)
    })

    it("should move items within an array using the moveItem method", () => {
      const form = useFormControl({
        tags: ["javascript", "vue", "typescript", "react"]
      })

      form.controlsTree.tags.control.moveItem(0, 2)

      expect(form.controlsTree.tags.control.state.value).toEqual([
        "vue",
        "typescript",
        "javascript",
        "react"
      ])
      expect(form.controlsTree.tags.control.dirty.value).toBe(true)
    })

    it("should move items backward within an array", () => {
      const form = useFormControl({
        tags: ["javascript", "vue", "typescript", "react"]
      })

      form.controlsTree.tags.control.moveItem(3, 1)

      expect(form.controlsTree.tags.control.state.value).toEqual([
        "javascript",
        "react",
        "vue",
        "typescript"
      ])
      expect(form.controlsTree.tags.control.dirty.value).toBe(true)
    })

    it("should work with nested array operations", () => {
      const form = useFormControl({
        users: [
          { name: "John", skills: ["javascript", "vue"] },
          { name: "Jane", skills: ["python"] }
        ]
      })

      // Add a skill to the first user
      form.controlsTree.users[0]!.skills.control.add("typescript")

      expect(form.controlsTree.users[0]?.skills.control.state.value).toEqual([
        "javascript",
        "vue",
        "typescript"
      ])

      // Remove a skill from the first user
      form.controlsTree.users[0]!.skills.control.remove(0)

      expect(form.controlsTree.users[0]?.skills.control.state.value).toEqual([
        "vue",
        "typescript"
      ])

      // Move a skill within the first user's skills
      form.controlsTree.users[0]!.skills.control.moveItem(0, 1)

      expect(form.controlsTree.users[0]?.skills.control.state.value).toEqual([
        "typescript",
        "vue"
      ])

      // Add a new user
      form.controlsTree.users.control.add({ name: "Bob", skills: ["react"] })

      expect(form.controlsTree.users.control.state.value).toEqual([
        { name: "John", skills: ["typescript", "vue"] },
        { name: "Jane", skills: ["python"] },
        { name: "Bob", skills: ["react"] }
      ])
    })

    it("should handle root-level array control operations", () => {
      const form = useFormControl<string[]>(["a", "b", "c"])

      // Add an item
      form.controlsTree.control.add("d")

      expect(form.controlsTree.control.state.value).toEqual([
        "a",
        "b",
        "c",
        "d"
      ])

      // Remove an item
      form.controlsTree.control.remove(1)

      expect(form.controlsTree.control.state.value).toEqual(["a", "c", "d"])

      // Move an item
      form.controlsTree.control.moveItem(0, 2)

      expect(form.controlsTree.control.state.value).toEqual(["c", "d", "a"])
      expect(form.controlsTree.control.dirty.value).toBe(true)
    })
  })
})
