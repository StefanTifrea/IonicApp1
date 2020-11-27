import React from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import {SongProps} from './SongProps';

interface SongPropsExt extends SongProps{
    onEdit: (_id?: string) => void;
}
/*
const formatDate = (date: Date) => {
    var d = new Date(date);
    var month = '' + (d.getMonth() + 1);
    var day = '' + d.getDate();
    var year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}
*/
const Song : React.FC<SongPropsExt> = ({ _id, name, artist, time, releaseDate, onEdit }) => {
    
    return (
        <IonItem onClick={() => onEdit(_id)}>
            <IonLabel>{artist} - {name} : {time} --- {releaseDate}</IonLabel>
        </IonItem>
    );
};

export default Song;