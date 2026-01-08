<script setup lang="ts" generic="TComponentGeneric extends any[]">
import type { ArrayFormNode } from "vue-reactive-form"

type Props<T extends any[]> = {
  label: string
  node: ArrayFormNode<T>
  error?: string
}

defineProps<Props<TComponentGeneric>>()
</script>

<template>
  <div class="array-input">
    <div class="header">
      <span class="label">{{ label }}</span>
      <button class="btn-secondary" type="button" @click="node.$control.add()">
        Add item
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="items-container">
      <div v-for="(childNode, index) in node" class="item-row" :key="index">
        <slot :node="childNode" />

        <button
          class="btn-delete"
          type="button"
          @click="node.$control.remove(index)"
          :key="index + 100000"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.array-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.label {
  font-weight: 500;
  color: #374151;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
}

.items-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: #f9fafb;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

button {
  cursor: pointer;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  transition: opacity 0.2s;
}

button:hover {
  opacity: 0.8;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
  font-weight: 500;
}

.btn-delete {
  background-color: transparent;
  color: #ef4444;
  font-size: 1rem;
  padding: 0 0.5rem;
  margin-top: 1.7rem; /* Align with input field */
}

.btn-delete:hover {
  background-color: #fee2e2;
}
</style>
