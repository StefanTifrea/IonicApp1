import {Plugins} from '@capacitor/core'
import { SongProps } from '../todo/SongProps';

const {Storage} = Plugins;

export function checkLoginToken(){
    return Storage.get({key: 'token'});
}

export function clearToken(){
    return Storage.remove({key: 'token'});
}

export async function addLocalItems(items: SongProps[]) {
    Storage.set({key: 'items', value: JSON.stringify(items)});
}

export async function getLocalItems() {
    return Storage.get({key: 'items'});
}