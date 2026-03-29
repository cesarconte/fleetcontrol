import { VueQueryPlugin } from '@tanstack/vue-query'

export { VueQueryPlugin }

export const vueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  },
}
