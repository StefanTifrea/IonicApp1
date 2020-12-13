import { OperationCanceledException } from "typescript";
import Song from "./Song";
import { SongProps } from "./SongProps";

export class OperationProps{
    type: string;
    song: SongProps;

    constructor(type: string, song: SongProps){
        this.type = type;
        this.song = song;
    }
}
