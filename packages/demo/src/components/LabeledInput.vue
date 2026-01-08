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
  <div>
    <label>
      <div>{{ label }}</div>
      <input v-model="modelValue" :type />
    </label>
    <div v-if="error" style="color: red">
      {{ error }}
    </div>
  </div>
</template>
