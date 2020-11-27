import {Plugins} from '@capacitor/core'

const {Storage} = Plugins;

export function clearToken(){
    return Storage.remove({key: 'token'});
}