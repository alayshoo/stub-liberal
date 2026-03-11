import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
    }),
    paths: {
      // Replace 'your-repo-name' with your actual repo name
      base: process.env.NODE_ENV === 'production' ? '/stub-liberal' : '',
    }
  }
};