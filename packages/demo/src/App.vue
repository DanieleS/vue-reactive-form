<script setup lang="ts">
import { useForm } from "vue-reactive-form"
import LabeledInput from "./components/LabeledInput.vue"
import ArrayInput from "./components/ArrayInput.vue"
import {
  projectFormSchema,
  type ProjectFormState,
  type ValidProjectFormState
} from "./demo-form"

const { form, errors, handleSubmit } = useForm<
  ProjectFormState,
  ValidProjectFormState
>({}, { validationSchema: projectFormSchema })

const onSubmit = handleSubmit({
  onSuccess: (state) => {
    alert("Form submitted with state:\n" + JSON.stringify(state, null, 2))
  },
  onError: (errors) => {
    console.log("Form submission failed with errors:", errors)
  }
})
</script>

<template>
  <h1>Vue reactive form demo</h1>

  <div style="display: grid; grid-template-columns: 1fr 1fr">
    <form style="display: flex; flex-direction: column; gap: 16px">
      <h2>Form UI</h2>

      <LabeledInput
        label="Name"
        v-model="form.name.$control.state.value"
        :error="form.name.$control.errorMessage.value"
        type="text"
      />

      <LabeledInput
        label="Description"
        v-model="form.description.$control.state.value"
        :error="form.description.$control.errorMessage.value"
        type="text"
      />

      <LabeledInput
        label="Budget"
        v-model="form.budget.$control.state.value"
        :error="form.budget.$control.errorMessage.value"
        type="number"
      />

      <div>
        <label>
          <div>Is public</div>
          <input
            :checked="form.isPublic.$control.state.value"
            type="checkbox"
            @change="
              (e) =>
                (form.isPublic.$control.state.value = (e.target as any).checked)
            "
          />
        </label>
        <div
          v-if="form.isPublic.$control.errorMessage.value"
          style="color: red"
        >
          {{ form.isPublic.$control.errorMessage.value }}
        </div>
      </div>

      <LabeledInput
        label="Client name"
        v-model="form.client.name.$control.state.value"
        :error="form.client.name.$control.errorMessage.value"
        type="text"
      />

      <LabeledInput
        label="Client street address"
        v-model="form.client.address.street.$control.state.value"
        :error="form.client.address.street.$control.errorMessage.value"
        type="text"
      />

      <LabeledInput
        label="Client city"
        v-model="form.client.address.city.$control.state.value"
        :error="form.client.address.city.$control.errorMessage.value"
        type="text"
      />

      <ArrayInput
        label="Team members"
        :node="form.teamMembers"
        :error="form.teamMembers.$control.errorMessage.value"
      >
        <template #="{ node }">
          <LabeledInput
            label="Name"
            v-model="node.name.$control.state.value"
            :error="node.name.$control.errorMessage.value"
            type="text"
          />
          <LabeledInput
            label="Hourly rate"
            v-model="node.hourlyRate.$control.state.value"
            :error="node.hourlyRate.$control.errorMessage.value"
            type="number"
          />
        </template>
      </ArrayInput>

      <ArrayInput
        label="Tags"
        :node="form.tags"
        :error="form.tags.$control.errorMessage.value"
      >
        <template #="{ node }">
          <LabeledInput
            label="Name"
            v-model="node.$control.state.value"
            :error="node.$control.errorMessage.value"
            type="text"
          />
        </template>
      </ArrayInput>

      <button @click="onSubmit">Submit</button>
    </form>

    <div>
      <div>
        <h2>Form state inspector</h2>
        <pre>{{ form.$control.state.value }}</pre>
      </div>

      <h2>Form errors inspector</h2>
      <pre>{{ errors }}</pre>
    </div>
  </div>
</template>
