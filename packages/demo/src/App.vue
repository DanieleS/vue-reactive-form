<script setup lang="ts">
import { useForm } from "vue-reactive-form"
import LabeledInput from "./components/LabeledInput.vue"
import ArrayInput from "./components/ArrayInput.vue"

type Tag = "infrastructure" | "frontend" | "backend" | "full-stack"

type ProjectFormState = {
  name: string
  description: string
  budget: number
  isPublic: true
  client: {
    name: string
    address: {
      street: string
      city: string
    }
  }
  teamMembers: {
    name: string
    hourlyRate: number
  }[]
  tags: Tag[]
}

const { form } = useForm<ProjectFormState>({})
</script>

<template>
  <h1>Vue reactive form demo</h1>

  <div style="display: grid; grid-template-columns: 1fr 1fr">
    <form style="display: flex; flex-direction: column; gap: 16px">
      <h2>Form UI</h2>

      <LabeledInput
        label="Name"
        v-model="form.name.$control.state.value"
        type="text"
      />

      <LabeledInput
        label="Description"
        v-model="form.description.$control.state.value"
        type="text"
      />

      <LabeledInput
        label="Budget"
        v-model="form.budget.$control.state.value"
        type="number"
      />

      <div>
        <label>
          <div>Is public</div>
          <input
            :checked="form.isPublic.$control.state.value"
            type="checkbox"
            @change="(e) => form.isPublic.$control.state.value = (e.target as any).checked"
          />
        </label>
      </div>

      <LabeledInput
        label="Client name"
        v-model="form.client.name.$control.state.value"
        type="text"
      />

      <LabeledInput
        label="Client street address"
        v-model="form.client.address.street.$control.state.value"
        type="text"
      />

      <LabeledInput
        label="Client city"
        v-model="form.client.address.city.$control.state.value"
        type="text"
      />

      <ArrayInput label="Team members" :node="form.teamMembers">
        <template #="{ node }">
          <LabeledInput
            label="Name"
            v-model="node.name.$control.state.value"
            type="text"
          />
          <LabeledInput
            label="Hourly rate"
            v-model="node.hourlyRate.$control.state.value"
            type="number"
          />
        </template>
      </ArrayInput>

      <ArrayInput label="Tags" :node="form.tags">
        <template #="{ node }">
          <LabeledInput
            label="Name"
            v-model="node.$control.state.value"
            type="text"
          />
        </template>
      </ArrayInput>
    </form>

    <div>
      <h2>Form state inspector</h2>
      <pre>{{ form.$control.state.value }}</pre>
    </div>
  </div>
</template>
