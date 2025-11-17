// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@vueuse/nuxt', '@nuxt/ui'],
  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI || '',
    public: {}
  }
})
