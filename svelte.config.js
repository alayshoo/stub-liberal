import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      fallback: '404.html'
    }),
    paths: {
      // Replace 'my-app' with your GitHub repo name
      base: process.env.NODE_ENV === 'production' ? '/my-app' : ''
    }
  }
};