import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';

interface RouteParams {
  id: string;
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/home'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/home'
      },
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/Home.vue')
      },
      {
        path: 'locations',
        name: 'Locations',
        component: () => import('@/views/Locations.vue')
      },
      {
        path: 'recipes',
        name: 'Recipes',
        component: () => import('@/views/Recipes.vue')
      },
      {
        path: 'preferences',
        name: 'Preferences',
        component: () => import('@/views/Preferences.vue')
      }
    ]
  },
  {
    path: '/recipes/:id',
    name: 'RecipeDetails',
    component: () => import('@/views/RecipeDetails.vue'),
    props: (route) => ({ id: route.params.id }),
    beforeEnter: (to, from, next) => {
      if (!to.params.id) {
        next({ name: 'Recipes' });
      } else {
        next();
      }
    }
  },
  {
    path: '/locations/:id',
    name: 'LocationDetails',
    component: () => import('@/views/LocationDetails.vue'),
    props: (route) => ({ id: route.params.id }),
    beforeEnter: (to, from, next) => {
      if (!to.params.id) {
        next({ name: 'Locations' });
      } else {
        next();
      }
    }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;