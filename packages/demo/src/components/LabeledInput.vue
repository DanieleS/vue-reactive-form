<script setup lang="ts" generic="T">
import type { InputHTMLAttributes } from "vue"

interface Props {
  label: string
  type: InputHTMLAttributes["type"]
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
  </div>
</template>
