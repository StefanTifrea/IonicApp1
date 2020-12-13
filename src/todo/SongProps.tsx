import { Photo } from './usePhotoGalllery';

export interface SongProps{
    _id?: string;
    name: string;
    artist: string;
    time: number;
    releaseDate: string;
    coverArt: Photo;
}