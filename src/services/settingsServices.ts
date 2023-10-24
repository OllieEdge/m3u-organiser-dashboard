import { request } from 'umi';

export async function getSettings() {
  return request('http://localhost:3440/settings', {
    method: 'GET',
  });
}

export async function saveSettings(data) {
  return request('http://localhost:3440/settings', {
    method: 'POST',
    data,
  });
}
