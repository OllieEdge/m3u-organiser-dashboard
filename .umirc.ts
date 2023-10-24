import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  locale: {
    default: 'en-US', // Set default locale
    antd: true, // Use antd's built-in locale support
  },
  layout: {
    title: 'M3U Organiser',
    name: 'Ant Design Pro',
    logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
  },
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/home',
      component: './Home',
      name: 'Dashboard',
      icon: 'Bars',
    },
    {
      path: '/channels',
      component: './MyChannels',
      name: 'My Channels',
      icon: 'Desktop',
    },
    {
      path: '/filter/m3u',
      component: './FilterM3Us',
      name: 'Filter Channels',
      icon: 'Filter',
    },
    {
      path: '/settings',
      component: './Settings',
      name: 'Settings',
      icon: 'SettingOutlined',
    },
  ],
  npmClient: 'pnpm',
});

