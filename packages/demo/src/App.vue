<script setup lang="ts">
import { ref, watchEffect } from "vue"
import { useForm } from "vue-reactive-form"

type ProjectFormState = {
  name: string
  description: string
  budget: number
  isPublic: true
  client: {
    name: string
    email: string
    address: {
      street: string
      city: string
    }
  }
  teamMembers: {
    name: string
    hourlyRate: number
  }[]
  tags: string[]
}

const { form } = useForm<ProjectFormState>({})

watchEffect(() => {
  console.log("aaaaaaaaaaaaaa", form.name.$control.state.value)
})
</script>

<template>
  <h1>Vue reactive form demo</h1>

  <form style="display: flex; flex-direction: column; gap: 16px">
    <label>
      <div>Name</div>
      <input v-model="form.name.$control.state.value" type="text" />
    </label>

    <div>
      <label>
        <div>Description</div>
        <input v-model="form.description.$control.state.value" type="text" />
      </label>
    </div>
  </form>
</template>
