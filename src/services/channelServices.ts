import { request } from 'umi';

export async function getMyChannels() {
  return request('http://localhost:3440/m3u/my', {
    method: 'GET',
  });
}

export async function updateMyChannels(data) {
  return request('http://localhost:3440/m3u/my', {
    method: 'POST',
    data,
  });
}
