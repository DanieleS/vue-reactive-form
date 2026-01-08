<script setup lang="ts" generic="T">
import type { InputHTMLAttributes } from "vue"

interface Props {
  label: string
  type: InputHTMLAttributes["type"]
  error?: string
}

const modelValue = defineModel<T>()

defineProps<Props>()
</script>

<template>
  <div class="labeled-input">
    <label>
      <div class="label-text">{{ label }}</div>
      <input v-model="modelValue" :type class="input-field" />
    </label>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.labeled-input {
  display: flex;
  flex-direction: column;
}

.label-text {
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: #374151;
}

.input-field {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.95rem;
  box-sizing: border-box;
}

.input-field:focus {
  border-color: #4f46e5;
  outline: none;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>
