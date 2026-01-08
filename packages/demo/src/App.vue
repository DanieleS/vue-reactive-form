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
  <div class="container">
    <h1 class="title">Vue reactive form demo</h1>

    <div class="layout">
      <div class="card form-card">
        <form class="form-layout" @submit.prevent="onSubmit">
          <h2 class="section-title">Form UI</h2>

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

          <div class="checkbox-wrapper">
            <label class="checkbox-label">
              <input
                :checked="form.isPublic.$control.state.value"
                type="checkbox"
                @change="
                  (e) =>
                    (form.isPublic.$control.state.value = (
                      e.target as any
                    ).checked)
                "
              />
              <span>Is public</span>
            </label>
            <div
              v-if="form.isPublic.$control.errorMessage.value"
              class="error-message"
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
              <div class="grid-col-2">
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
              </div>
            </template>
          </ArrayInput>

          <ArrayInput
            label="Tags"
            :node="form.tags"
            :error="form.tags.$control.errorMessage.value"
          >
            <template #="{ node }">
              <div class="grid-full">
                <LabeledInput
                  label="Name"
                  v-model="node.$control.state.value"
                  :error="node.$control.errorMessage.value"
                  type="text"
                />
              </div>
            </template>
          </ArrayInput>

          <button class="submit-btn" type="submit">Submit</button>
        </form>
      </div>

      <div class="card inspector-card">
        <div class="inspector-section">
          <h2 class="section-title">Form state inspector</h2>
          <pre>{{ form.$control.state.value }}</pre>
        </div>

        <div class="inspector-section">
          <h2 class="section-title">Form errors inspector</h2>
          <pre>{{ errors }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --bg: #f3f4f6;
  --surface: #ffffff;
  --text: #1f2937;
  --border: #e5e7eb;
}

body {
  font-family:
    "Inter",
    system-ui,
    -apple-system,
    sans-serif;
  background-color: var(--bg);
  color: var(--text);
  margin: 0;
  line-height: 1.5;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
}

.title {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #111827;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 1024px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

.card {
  background: var(--surface);
  border-radius: 12px;
  padding: 2rem;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.1),
    0 2px 4px -1px rgb(0 0 0 / 0.06);
  border: 1px solid var(--border);
}

.form-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  margin-top: 0;
  font-size: 1.25rem;
  font-weight: 600;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.75rem;
  margin-bottom: 1.5rem;
  color: #111827;
}

.checkbox-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  cursor: pointer;
}

.checkbox-label input {
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 4px;
}

.submit-btn {
  background-color: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;
  width: 100%;
}

.submit-btn:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.inspector-section + .inspector-section {
  margin-top: 2rem;
}

.inspector-section pre {
  background-color: #f8fafc;
  padding: 1.25rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.875rem;
  font-family: "Menlo", "Monaco", "Courier New", monospace;
  border: 1px solid var(--border);
  margin: 0;
  white-space: pre-wrap;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
}

/* Helpers for ArrayInput slots */
.grid-col-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  flex: 1;
}

.grid-full {
  flex: 1;
}
</style>
