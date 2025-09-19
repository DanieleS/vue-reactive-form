import type { Ref } from "@vue/reactivity"
import { createArrayInputControl } from "./arrayInputControl"
import { get } from "lodash-es"
import type { InputControl } from "./types/controls"
import type { ControlsCache, FormErrorsState } from "./types"

const getInputControl = (
  formState: Ref<unknown>,
  defaultFormState: Ref<unknown>,
  formErrors: Ref<FormErrorsState>,
  controlsCache: ControlsCache,
  path: (string | number | symbol)[]
) => {
  const concatenatedPath: string = path.join(".")

  if (!controlsCache.has(concatenatedPath)) {
    controlsCache.set(
      concatenatedPath,
      createArrayInputControl(
        formState,
        defaultFormState,
        formErrors,
        path
      ) as InputControl<unknown>
    )
  }

  return controlsCache.get(concatenatedPath)
}

export const createControlsTree = <TState>(
  formState: Ref<TState>,
  defaultFormState: Ref<TState | undefined>,
  formErrors: Ref<FormErrorsState>,
  controlsCache: ControlsCache
) => {
  const buildProxyHandler = (path: (string | number | symbol)[] = []) => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(target: any, handlerPath: string | number | symbol) {
      const fullPath = [...path, handlerPath]

      if (handlerPath === Symbol.iterator) {
        return function* () {
          const array = get(formState.value, path) ?? []
          for (let i = 0; i < array.length; i++) {
            const iteratorPath = [...path, i]
            target[i] = buildProxyControl(
              formState,
              defaultFormState,
              formErrors,
              controlsCache,
              iteratorPath
            )
            yield target[i]
          }
        }
      }

      if (!Reflect.get(target, handlerPath)) {
        Reflect.set(
          target,
          handlerPath,
          buildProxyControl(
            formState,
            defaultFormState,
            formErrors,
            controlsCache,
            fullPath
          )
        )
      }

      return Reflect.get(target, handlerPath)
    }
  })

  const buildProxyControl = (
    formState: Ref<TState>,
    defaultFormState: Ref<TState | undefined>,
    formErrors: Ref<FormErrorsState>,
    controlsCache: ControlsCache,
    path: (string | number | symbol)[]
  ) => {
    return new Proxy(
      {
        control: getInputControl(
          formState,
          defaultFormState,
          formErrors,
          controlsCache,
          path
        )
      },
      buildProxyHandler(path)
    )
  }

  return buildProxyControl(
    formState,
    defaultFormState,
    formErrors,
    controlsCache,
    []
  )
}
