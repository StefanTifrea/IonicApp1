import React, { useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonList, IonLoading,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter
} from '@ionic/react';
import { add, logOut, wifi, warning } from 'ionicons/icons';
import Song from './Song';
import { getLogger } from '../core';
import { SongContext } from './SongProvider';
import { SongProps } from './SongProps';
import { useNetwork } from '../network/useNetwork';
import { logDOM } from '@testing-library/react';

const log = getLogger('SongList');

const SongList : React.FC<RouteComponentProps> = ({history}) =>{
    const {songs, fetching, fetchingError, getSongsCallBack } = useContext(SongContext);
    const [searchSong, setSearchSong] = useState<string>('');
    const [page, setPage] = useState<number>(1);
    const [endScrolling, setEndScrolling] = useState<boolean>(false);

    const {networkStatus} = useNetwork();

    const pageSize = 7;

    useEffect(() => {
      fetchData()
    }, [page, endScrolling])

    useIonViewWillEnter(async () => {
      fetchData();
    });

    async function fetchData(reset?: boolean) {
        log('It\'s called ', page, pageSize, endScrolling)
        if(!getSongsCallBack){
          return;
        }
        await getSongsCallBack(page, pageSize, endScrolling);
    }
    
    async function searchNext($event: CustomEvent<void>) {
      if(songs){
        if(page * pageSize > songs.length){
          setEndScrolling(true);
        }
      }
      log('next page ', page);
      setPage(page + 1);
      ($event.target as HTMLIonInfiniteScrollElement).complete();
      
      
    }

    log('render');
    return (
        <IonPage>
          <IonHeader>
            <IonToolbar>
              <IonTitle>My App</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent fullscreen>
            <IonSearchbar
              value={searchSong} debounce = {1000} 
              onIonChange={e => setSearchSong(e.detail.value!)}>
            </IonSearchbar>
            <IonLoading isOpen={fetching} message="Fetching songs" />
            {songs && (
            <IonList>
              {songs
              .filter(song => song.name.toLowerCase().indexOf(searchSong.toLowerCase()) >= 0 || song.artist.toLowerCase().indexOf(searchSong.toLowerCase()) >= 0)
              .map(({ _id, name, artist, time, releaseDate, coverArt}) =>
                <Song key={_id} _id={_id} name={name} artist={artist} time={time} releaseDate={releaseDate} coverArt={coverArt} onEdit={id => history.push(`/song/${id}`)} />
              )}
            </IonList>
            )}
            {fetchingError && (
            <div>{fetchingError.message || 'Failed to fetch songs'}</div>
            )}
            <IonFab vertical="bottom" horizontal="start" slot="fixed">
              <IonFabButton onClick={() => history.push('/song')}>
                <IonIcon icon={add} />
              </IonFabButton>
            </IonFab>
            <IonFab vertical="bottom" horizontal="end" slot="fixed">
              <IonFabButton onClick={() => history.push('/logout')}>
                <IonIcon icon={logOut} />
              </IonFabButton>
            </IonFab>
            <IonFab vertical="top" horizontal="center" slot="fixed">
              <IonFabButton disabled={true} color="primary">
                <IonIcon icon={networkStatus.connected ? wifi : warning}></IonIcon>
              </IonFabButton>
            </IonFab>
            <IonInfiniteScroll threshold="100px" disabled={endScrolling} onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
              <IonInfiniteScrollContent loadingText="Loading more songs..."></IonInfiniteScrollContent>
            </IonInfiniteScroll>
        </IonContent>
        </IonPage>
      );
}

export default SongList;