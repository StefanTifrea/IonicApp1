import React, { useContext, useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { getLogger } from '../core';
import { SongContext } from './SongProvider';
import { RouteComponentProps } from 'react-router';
import { SongProps } from './SongProps';
import {Photo} from './usePhotoGalllery';

const log = getLogger('SongEdit');

interface SongEditProps extends RouteComponentProps <{
    id?: string;
}> {}

const SongEdit: React.FC<SongEditProps> = ({ history, match }) => {
    const { songs, saving, savingError, saveSong } = useContext(SongContext);
    log(songs?.length);
    const [name, setName] = useState('');
    const [artist, setArtist] = useState('');
    const [time, setTime] = useState(0);
    const [releaseDate, setReleaseDate] = useState("2000-1-1");
    const [coverArt, setCoverArt] = useState(new Photo('',''));
    const [song, setSong] = useState<SongProps>();
    useEffect(() => {
      log('useEffect');
      const routeId = match.params.id || '';
      log("this is routeId " + routeId);
      const song = songs?.find(it => it._id === routeId);
      setSong(song);
      log(song?.name);
      if (song) {
        setName(song.name);
        setArtist(song.artist);
        setTime(song.time);
        setReleaseDate(song.releaseDate);
        setCoverArt(song.coverArt);
      }
    }, [match.params.id, songs]);
    const handleSave = () => {
      const editedSong = song ? { ...song, name, artist, time, releaseDate, coverArt } : { name, artist, time, releaseDate, coverArt };
      saveSong && saveSong(editedSong).then(() => history.goBack());
    };
    log('render');
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Edit</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleSave}>
                Save
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonInput value={name} onIonChange={e => setName(e.detail.value || '')} />
          <IonInput value={artist} onIonChange={e => setArtist(e.detail.value || '')} />
          <IonInput value={time} onIonChange={e => setTime(parseInt(e.detail.value || '0', 10))} />
          <IonInput value={releaseDate.toString()} onIonChange={e => setReleaseDate(e.detail.value || '')} />
          <IonLoading isOpen={saving} />
          {savingError && (
            <div>{savingError.message || 'Failed to save song'}</div>
          )}
        </IonContent>
      </IonPage>
    );
  };
  
export default SongEdit;