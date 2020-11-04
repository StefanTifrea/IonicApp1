import axios from 'axios';
import { getLogger } from '../core';
import { SongProps } from './SongProps';

const log = getLogger('songApi');

const baseUrl = 'localhost:3000';
const songUrl = `http://${baseUrl}/song`;

interface ResponseProps<T>{
  data: T;
}

function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
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

const config = {
  headers: {
    'Content-Type': 'application/json'
  }
};

export const getSongs: () => Promise<SongProps[]> = () =>{
  return withLogs(axios.get(songUrl, config), 'getSongs');
}
 
export const createSong: (song: SongProps) => Promise<SongProps[]> = song => {
  return withLogs(axios.post(songUrl, song, config), 'createSong');
}

export const updateSong: (song: SongProps) => Promise<SongProps[]> = song => {
  return withLogs(axios.put(`${songUrl}/${song.id}`, song, config), 'updateSong');
}

interface MessageData {
  event: string;
  payload: {
    song: SongProps;
  };
}

export const newWebSocket = (onMessage: (data: MessageData) => void) => {
  const ws = new WebSocket(`ws://${baseUrl}`)
  ws.onopen = () => {
    log('web socket onopen');
  };
  ws.onclose = () => {
    log('web socket onclose');
  };
  ws.onerror = error => {
    log('web socket onerror', error);
  };
  ws.onmessage = messageEvent => {
    log('web socket onmessage');
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  }
}