import { ref, shallowRef } from "@vue/reactivity"
import type { Object } from "ts-toolbelt"
import { cloneDeep } from "lodash-es"
import type { FormControl, InputControl } from "./types"
import { createControlsTree } from "./controlsTree"

const useFormControl = <T extends object>(
  defaultState: Object.Partial<T, "deep"> = {}
): FormControl<T> => {
  const defaultFormState = shallowRef(cloneDeep(defaultState))
  const state = ref<Object.Partial<T, "deep">>(cloneDeep(defaultState))
  const controlsCache = new Map<string, InputControl<unknown>>()

  const controlsTree = createControlsTree<T>(
    state,
    defaultFormState,
    controlsCache
  )

  return {
    controlsTree
  }
}

type State = {
  name: string
  age: number
  address: {
    street: string
    city: string
  }
  tags: string[]
}

const testControl = useFormControl<State>({
  address: {
    city: "Gotham"
  }
})

testControl.controlsTree.age.control.state.value = 21
testControl.controlsTree.address.control.state.value = {
  street: "123 Main St",
  city: "Metropolis"
}
testControl.controlsTree.name.control.state.value = "John Doe"

console.log(
  "aaaaaaaaaaaaaa",
  testControl.controlsTree.name.control.defaultValue.value,
  testControl.controlsTree.name.control.state.value,
  " - ",
  testControl.controlsTree.address.control.defaultValue.value,
  testControl.controlsTree.address.control.state.value,
  " - ",
  testControl.controlsTree.address.city.control.defaultValue.value,
  testControl.controlsTree.address.city.control.state.value,
  " - ",
  testControl.controlsTree.age.control.defaultValue.value,
  testControl.controlsTree.age.control.state.value
)

testControl.controlsTree.tags.control.state.value = ["a", "b", "c"]

for (const a of testControl.controlsTree.tags) {
  a.control.state.value = a.control.state.value?.toUpperCase()
}

const secondTag = testControl.controlsTree.tags[1]
if (secondTag) {
  secondTag.control.state.value += "anana"
}

console.log(testControl.controlsTree.tags.control.state.value)
