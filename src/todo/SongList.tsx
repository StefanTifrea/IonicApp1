import React, { useContext } from 'react';
import { RouteComponentProps } from 'react-router';
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonList, IonLoading,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { add } from 'ionicons/icons';
import Song from './Song';
import { getLogger } from '../core';
import { SongContext } from './SongProvider';

const log = getLogger('SongList');

const SongList : React.FC<RouteComponentProps> = ({history}) =>{
    const {songs, fetching, fetchingError} = useContext(SongContext);
    log('render');
    return (
        <IonPage>
          <IonHeader>
            <IonToolbar>
              <IonTitle>My App</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonLoading isOpen={fetching} message="Fetching songs" />
            {songs && (
            <IonList>
              {songs.map(({ id, name, artist, time, releaseDate}) =>
                <Song key={id} id={id} name={name} artist={artist} time={time} releaseDate={releaseDate} onEdit={id => history.push(`/song/${id}`)} />)}
            </IonList>
            )}
            {fetchingError && (
            <div>{fetchingError.message || 'Failed to fetch songs'}</div>
            )}
            <IonFab vertical="bottom" horizontal="end" slot="fixed">
              <IonFabButton onClick={() => history.push('/song')}>
                <IonIcon icon={add} />
              </IonFabButton>
            </IonFab>
        </IonContent>
        </IonPage>
      );
}

export default SongList;