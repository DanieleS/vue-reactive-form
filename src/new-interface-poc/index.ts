import { shallowRef, type Ref } from "vue";
import type { IsPlainObject } from "./types/utils";
import type { Object } from "ts-toolbelt";
import { get } from "lodash";

type InputControl<T> = {
  state: Ref<T | undefined>;
  // .. all other input metadata
};

type PrimitiveFormNode<T> = {
  control: InputControl<T>; // maybe could be turned to control() to differentiate from the other properties..?
};

type ObjectFormNode<T extends object> = PrimitiveFormNode<T> & {
  [Key in keyof T]: FormNode<T[Key]>;
};

type FormNode<T> = IsPlainObject<T> extends true
  ? ObjectFormNode<T & object>
  : PrimitiveFormNode<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const controlsCache = new Map<string, InputControl<any>>();

const createControl = <T>(defaultValue?: T): InputControl<T> => {
  const state = shallowRef<T | undefined>(defaultValue); // I don't remember, how single state was handled, but it's not the main point of this now

  return {
    state,
  };
};

const getOrCreateControl = <T>(path: string[], defaultValue?: T) => {
  const concatenatedPath: string = path.join(".");

  if (controlsCache.has(concatenatedPath)) {
    return controlsCache.get(concatenatedPath);
  }

  const newControl = createControl(defaultValue);
  controlsCache.set(concatenatedPath, newControl);
  return newControl;
};

const createControlTree = <T extends object>(
  defaultValue: Object.Partial<T, "deep"> = {}
) => {
  const buildHandler = (path: string[] = []) => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(target: any, handlerPath: string) {
      const fullPath = [...path, handlerPath];

      if (!(handlerPath in target)) {
        target[handlerPath] = new Proxy(
          {
            control: getOrCreateControl(fullPath, get(defaultValue, fullPath)),
          },
          buildHandler(fullPath)
        );
      }
      return target[handlerPath];
    },
  });

  return new Proxy<FormNode<T>>({} as FormNode<T>, buildHandler());
};

type State = {
  name: string;
  age: number;
  address: {
    street: string;
    city: string;
  };
  tags: string[];
};

const testControl = createControlTree<State>();

testControl.address.city.control.state.value = "New York";
testControl.name.control.state.value = "John Doe";

console.log(
  "aaaaaaaaaaaaaa",
  testControl.name.control.state.value,
  " - ",
  testControl.address.city.control.state.value
);
