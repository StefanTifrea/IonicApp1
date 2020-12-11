import React, { useCallback, useEffect, useReducer, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { SongProps } from './SongProps';
import { createSong, getSongs, getSongsPage, updateSong, newWebSocket } from './SongApi';
import {AuthContext} from '../auth'
import { addLocalItems, getLocalItems } from '../core/LocalStorage'


const log = getLogger('SongProvider');

type SaveSongFn = (song: SongProps) => Promise<any>;
type GetSongsCallBackFn = (page: number, pageSize: number, endScrolling: boolean) => Promise<any>;

export interface SongsState {
    songs?: SongProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveSong?: SaveSongFn,
    getSongsCallBack?: GetSongsCallBackFn
}

interface ActionProps{
    type: string,
    payload?: any,
}

const initialState: SongsState = {
  fetching: false,
  saving: false,
};

const FETCH_SONGS_STARTED = 'FETCH_SONGS_STARTED';
const FETCH_SONGS_SUCCEEDED = 'FETCH_SONGS_SUCCEEDED';
const FETCH_SONGS_FAILED = 'FETCH_SONGS_FAILED';
const SAVE_SONG_STARTED = 'SAVE_SONG_STARTED';
const SAVE_SONG_SUCCEEDED = 'SAVE_SONG_SUCCEEDED';
const SAVE_SONG_FAILED = 'SAVE_SONG_FAILED';
const CLEAR_SONGS = 'CLEAR_SONGS';

const reducer: (state: SongsState, action: ActionProps) => SongsState =
  (state, { type, payload }) => {
    switch(type) {
      case FETCH_SONGS_STARTED:
        return { ...state, fetching: true, fetchingError: null };
      case FETCH_SONGS_SUCCEEDED:
        return { ...state, songs: payload.songs, fetching: false };
      case FETCH_SONGS_FAILED:
        return { ...state, fetchingError: payload.error, fetching: false };
      case SAVE_SONG_STARTED:
        return { ...state, savingError: null, saving: true };
      case SAVE_SONG_SUCCEEDED:
        const songs = [...(state.songs || [])];
        const song = payload.song;
        log("y" + song._id);
        const index = songs.findIndex(it => it._id === song._id);
        if (index === -1) {
          songs.splice(songs.length, 0, song);
        } else {
          songs[index] = song;
        }
        return { ...state,  songs, saving: false };
      case SAVE_SONG_FAILED:
        return { ...state, savingError: payload.error, saving: false };
      case CLEAR_SONGS:
        return { ...state, songs: []}
      default:
        return state;
    }
  };

export const SongContext = React.createContext<SongsState>(initialState);

interface SongProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const SongProvider: React.FC<SongProviderProps> = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { songs, fetching, fetchingError, saving, savingError } = state;

  const [page, setPage] = useState<number>(0);

  const [pageSize, setPageSize] = useState<number>(0);

  const [endScrolling, setEndScrolling] = useState<boolean>(false);

  const getSongsCallBack = useCallback<GetSongsCallBackFn>(setPageDetails, [token]);

  const saveSong = useCallback<SaveSongFn>(saveSongCallback, [token]);

  const value = { songs, fetching, fetchingError, saving, savingError, saveSong, getSongsCallBack };

  useEffect(getSongsEffect, [token, page, pageSize, endScrolling]);

  useEffect(wsEffect, [token]);

  log('returns');
  return (
    <SongContext.Provider value={value}>
      {children}
    </SongContext.Provider>
  );
  
  async function setPageDetails(page: number, pageSize: number, ending: boolean) {
    setPage(page);
    setPageSize(pageSize);
    setEndScrolling(ending);
  }

  function getSongsEffect() {
    let canceled = false;
    fetchSongs();
    return () => {
      canceled = true;
    }

    async function fetchSongs() {
      log('ended', endScrolling)
      if(endScrolling){
        return;
      }

      log('t t ', token);
      if(!token?.trim()){
        return;
      }

      let result = []
      try {
        log('fetchSongs started');
        dispatch({ type: FETCH_SONGS_STARTED });
        //const songs = await getSongs(token);
        //const items = [songs, await getSongsPage(token, page, pageSize)];
        

        const items = await getSongsPage(token, page, pageSize);

        log('items', items);
        log('songs??', songs);
        if(songs){
          if(songs.length >= pageSize){
            for(let i = 0;i<songs.length;i++){
              result.push(songs[i]);
            }
          }
          
        }
        for(let i = 0;i<items.length;i++){
          let n = true;
          for(let j = 0; j< result.length; j++){
            if(items[i]._id == result[j]._id){
              n = false;
              result[j] = items[i];
            }
            
          }
            
          if(n){
            result.push(items[i]);
          }
        }
        

        log('params', page, pageSize);
        log('gotten', result.length);
        log('fetchSongs succeeded');

        addLocalItems(result);

        if (!canceled) {
          dispatch({ type: FETCH_SONGS_SUCCEEDED, payload: { songs: result } });
        }

        if(items.length < pageSize){
          log('scrolling disabled');
            setEndScrolling(true);
            //setPage(page + 1);
        }
        
        
      } catch (error) {

        let locals = await getLocalItems();
        if(locals.value){
          log('fetchSongs local')
          result = JSON.parse(locals.value);
          dispatch({ type: FETCH_SONGS_SUCCEEDED, payload: { songs: result } });
        }
        else{
          log('fetchSongs failed');
          dispatch({ type: FETCH_SONGS_FAILED, payload: { error } });
        }

        
      }
        
    }
  }

  async function saveSongCallback(song: SongProps) {

      try {
        log('saveSong started');
        dispatch({ type: SAVE_SONG_STARTED });
        const savedSong = await (song._id ? updateSong(token, song) : createSong(token, song));
        log('saveSong succeeded' + savedSong);
        //dispatch({ type: SAVE_SONG_SUCCEEDED, payload: { song: savedSong } });
      } catch (error) {
        log('saveSong failed');
        dispatch({ type: SAVE_SONG_FAILED, payload: { error } });
      }
  

  }

  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    let closeWebSocket: () => void;
    if (token?.trim()) {
      closeWebSocket = newWebSocket(token, message => {
        if (canceled) {
          return;
        }
        const { type, payload: song } = message;
        log(`ws message, song ${type}`);
        if (type === 'created' || type === 'updated') {
          dispatch({ type: SAVE_SONG_SUCCEEDED, payload: { song } });
        }
      });
    }
    return () => {
      log('wsEffect - disconnecting');
      dispatch({type: 'CLEAR_SONGS'});
      canceled = true;
      closeWebSocket?.();
    }
  }
};
