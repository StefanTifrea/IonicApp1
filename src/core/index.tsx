import { Plugins } from '@capacitor/core';

export const baseUrl = 'localhost:3000';

export const getLogger: (tag: string) => (...args: any) => void =
    tag => (...args) => console.log(tag, ...args);

const log = getLogger('api');

export interface ResponseProps<T> {
  data: T;
}

export function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
  log(`${fnName} - started`);
  return promise
    .then(res => {
      log(`${fnName} - succeeded`);
      return Promise.resolve(res.data);
    })
    .catch(err => {
      log(`${fnName} - failed`);
      return Promise.reject(err);
    });
}

export const config = {
  headers: {
    'Content-Type': 'application/json'
  }
};

export const authConfig = (token?: string) => {
  log('token final ', token);
  return ({
  
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });
} 

export function getStoredToken(){
  const { Storage } = Plugins;

  const res = Storage.get({key: 'token'});

  return res;
}

export const storageObject = () => 
  (async () => {
    const { Storage } = Plugins;

    // Saving ({ key: string, value: string }) => Promise<void>
    await Storage.set({
      key: 'user',
      value: JSON.stringify({
        username: 'a', password: 'a',
      })
    });

    // Loading value by key ({ key: string }) => Promise<{ value: string | null }>
    const res = await Storage.get({ key: 'user' });
    if (res.value) {
      console.log('User found', JSON.parse(res.value));
    } else {
      console.log('User not found');
    }

    // Loading keys () => Promise<{ keys: string[] }>
    const { keys } = await Storage.keys();
    console.log('Keys found', keys);

    // Removing value by key, ({ key: string }) => Promise<void>
    await Storage.remove({ key: 'user' });
    console.log('Keys found after remove', await Storage.keys());

    // Clear storage () => Promise<void>
    await Storage.clear();
})