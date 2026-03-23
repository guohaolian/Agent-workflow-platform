import { createRouter, createWebHistory } from 'vue-router'
import WorkflowEditor from '@/views/WorkflowEditor.vue'

const routes = [
  {
    path: '/',
    name: 'Editor',
    component: WorkflowEditor
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
