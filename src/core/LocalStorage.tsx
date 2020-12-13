import {Plugins} from '@capacitor/core'
import { OperationProps } from '../todo/OperationProps';
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

export async function addItemToLocal(item: SongProps){
    const itemsPrev = await Storage.get({key: 'items'});
    if(itemsPrev.value){
        Storage.set({key: 'items', value: JSON.stringify([...JSON.parse(itemsPrev.value), item])})
    }
    else{
        Storage.set({key: 'items' , value: JSON.stringify([item])});
    }
}

export async function getLocalItems() {
    return Storage.get({key: 'items'});
}

export async function setOfflineOperations(items: OperationProps[]){
    Storage.set({key: 'operations', value: JSON.stringify(items)});
}

export async function addOperationToLocal(item: OperationProps){
    const itemsPrev = await Storage.get({key: 'operations'});
    if(itemsPrev.value){
        Storage.set({key: 'operations', value: JSON.stringify([...JSON.parse(itemsPrev.value), item])})
    }
    else{
        Storage.set({key: 'operations' , value: JSON.stringify([item])});
    }
}

export async function getOfflineOperations() {
    return Storage.get({key: 'operations'});
}

export async function clearOfflineOperations(){
    return Storage.remove({key: 'operations'});
}

export async function clearLocalItems() {
    return Storage.remove({key: 'items'});
}