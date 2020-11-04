import React, { useCallback, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { SongProps } from './SongProps';
import { createSong, getSongs, updateSong, newWebSocket } from './SongApi';

const log = getLogger('SongProvider');

type SaveSongFn = (song: SongProps) => Promise<any>;

export interface SongsState {
    songs?: SongProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveSong?: SaveSongFn,
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
        log("payl " + payload);
        log("Cursed song" + song);
        log(songs);
        const index = songs.findIndex(it => it.id === song.id);
        if (index === -1) {
          songs.splice(0, 0, song);
        } else {
          songs[index] = song;
        }
        return { ...state,  songs, saving: false };
      case SAVE_SONG_FAILED:
        return { ...state, savingError: payload.error, saving: false };
      default:
        return state;
    }
  };

  export const SongContext = React.createContext<SongsState>(initialState);

interface SongProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const SongProvider: React.FC<SongProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { songs, fetching, fetchingError, saving, savingError } = state;
  useEffect(getSongsEffect, []);
  useEffect(wsEffect, []);
  const saveSong = useCallback<SaveSongFn>(saveSongCallback, []);
  const value = { songs, fetching, fetchingError, saving, savingError, saveSong };
  log('returns');
  return (
    <SongContext.Provider value={value}>
      {children}
    </SongContext.Provider>
  );

  function getSongsEffect() {
    let canceled = false;
    fetchSongs();
    return () => {
      canceled = true;
    }

    async function fetchSongs() {
      try {
        log('fetchSongs started');
        dispatch({ type: FETCH_SONGS_STARTED });
        const songs = await getSongs();
        log('fetchSongs succeeded');
        if (!canceled) {
          dispatch({ type: FETCH_SONGS_SUCCEEDED, payload: { songs } });
        }
      } catch (error) {
        log('fetchSongs failed');
        dispatch({ type: FETCH_SONGS_FAILED, payload: { error } });
      }
    }
  }

  async function saveSongCallback(song: SongProps) {
    try {
      log('saveSong started');
      dispatch({ type: SAVE_SONG_STARTED });
      const savedSong = await (song.id ? updateSong(song) : createSong(song));
      log('saveSong succeeded');
      dispatch({ type: SAVE_SONG_SUCCEEDED, payload: { song: savedSong } });
    } catch (error) {
      log('saveSong failed');
      dispatch({ type: SAVE_SONG_FAILED, payload: { error } });
    }
  }

  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    const closeWebSocket = newWebSocket(message => {
      if (canceled) {
        return;
      }
      const { event, payload: { song }} = message;
      log(`ws message, song ${event}`);
      if (event === 'created' || event === 'updated') {
        dispatch({ type: SAVE_SONG_SUCCEEDED, payload: { song } });
      }
    });
    return () => {
      log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket();
    }
  }
};

