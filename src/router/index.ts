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
        component: () => import('@/views/HomePage.vue')
      },
      {
        path: 'locations',
        name: 'Locations',
        component: () => import('@/views/LocationsArchive.vue')
      },
      {
        path: 'recipes',
        name: 'Recipes',
        component: () => import('@/views/RecipesArchive.vue')
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
    name: 'RecipeSingle',
    component: () => import('@/views/RecipesSingle.vue'),
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
    name: 'LocationSingle',
    component: () => import('@/views/LocationsSingle.vue'),
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