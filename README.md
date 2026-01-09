# vue-reactive-form

`vue-reactive-form` is a lightweight, type-safe form validation library for Vue 3 that leverages Vue's reactivity system to provide a seamless and flexible way to manage form state and validation.

🚀 **Get started in minutes** — no boilerplate, no learning curve. Just reactive forms that work.

Check out the [live demo](https://danieles.github.io/vue-reactive-form/) for a hands-on example of how to use `vue-reactive-form`.

## Features

- **Lightweight** — Minimal footprint, designed to focus on form state and validation without unnecessary bloat.
- **Type Safety** — Built with TypeScript, ensuring your form values and validation rules are fully typed for a superior developer experience.
- **Standard Schema Validation** — Supports [Standard Schema](https://github.com/standard-schema/standard-schema) validation, making it compatible with libraries like Yup, Zod, and Valibot out of the box.
- **Headless & UI Agnostic** — Provides core form logic and state management without enforcing any UI components or styles. Seamlessly integrates with any UI library or custom design system.

## Installation

```bash
npm install vue-reactive-form
# or
pnpm add vue-reactive-form
# or
yarn add vue-reactive-form
```

## Basic Usage

Here is a simple example of how to use `vue-reactive-form` to manage form state.

```vue
<script setup lang="ts">
import { useForm } from "vue-reactive-form"

// 1. Define your form state
const { form, handleSubmit } = useForm({
  name: "",
  email: ""
})

// 2. Create a submit handler
const onSubmit = handleSubmit({
  onSuccess: (data) => {
    console.log("Form submitted:", data)
  }
})
</script>

<template>
  <form @submit.prevent="onSubmit">
    <div>
      <label>Name</label>
      <!-- 3. Bind to form controls -->
      <input v-model="form.name.$control.state.value" type="text" />
    </div>

    <div>
      <label>Email</label>
      <input v-model="form.email.$control.state.value" type="email" />
    </div>

    <button type="submit">Submit</button>
  </form>
</template>
```

### Understanding the `$control` Pattern

Each form field exposes a `$control` object that provides:

- `state.value` — The current value of the field (reactive)
- `errorMessage.value` — The validation error message (if any)
- `touched` / `dirty` — Track user interaction with the field

## Usage with Validation

You can easily integrate validation libraries like Yup. `vue-reactive-form` supports `@standard-schema/spec`, making it compatible with many popular validation libraries.

```vue
<script setup lang="ts">
import { useForm } from "vue-reactive-form"
import { object, string, Schema } from "yup"

type FormState = {
  name: string
  email: string
}

const schema: Schema<FormState> = object({
  name: string().required("Name is required"),
  email: string().email("Invalid email").required("Email is required")
})

const { form, handleSubmit } = useForm(
  {},
  {
    validationSchema: schema
  }
)

const onSubmit = handleSubmit({
  onSuccess: (data) => {
    // data is typed and validated
    console.log("Valid submission:", data)
  },
  onError: (errors) => {
    console.log("Validation errors:", errors)
  }
})
</script>

<template>
  <form @submit.prevent="onSubmit">
    <div>
      <label>Name</label>
      <input v-model="form.name.$control.state.value" type="text" />
      <span v-if="form.name.$control.errorMessage.value">
        {{ form.name.$control.errorMessage.value }}
      </span>
    </div>

    <div>
      <label>Email</label>
      <input v-model="form.email.$control.state.value" type="email" />
      <span v-if="form.email.$control.errorMessage.value">
        {{ form.email.$control.errorMessage.value }}
      </span>
    </div>

    <button type="submit">Submit</button>
  </form>
</template>
```

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request if you have ideas for improvements or find any bugs.

## 📄 License

MIT License — see the [LICENSE](./LICENSE) file for details.
