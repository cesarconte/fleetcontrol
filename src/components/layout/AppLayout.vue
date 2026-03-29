<template>
  <v-app>
    <AppSidebar v-if="!isBlankLayout" />
    <AppTopBar v-if="!isBlankLayout" />

    <v-main>
      <v-container :fluid="isBlankLayout" class="pa-4 pa-md-6">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </v-container>
    </v-main>

    <AppNotifications />
  </v-app>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
import AppTopBar from './AppTopBar.vue'
import AppNotifications from '@/components/ui/AppNotifications.vue'

const route = useRoute()
const isBlankLayout = computed(() => route.meta.layout === 'blank')
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
