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
  <div>
    <div>
      <span>{{ label }}</span>
      <button
        style="margin-left: 24px"
        type="button"
        @click="node.$control.add()"
      >
        Add item
      </button>
    </div>

    <div v-if="error" style="color: red">
      {{ error }}
    </div>

    <div v-for="(childNode, index) in node" style="display: flex" :key="index">
      <slot :node="childNode" />

      <button
        type="button"
        @click="node.$control.remove(index)"
        :key="index + 100000"
      >
        Delete item
      </button>
    </div>
  </div>
</template>
