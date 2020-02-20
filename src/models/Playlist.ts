import { Song } from './Song';

export class Playlist {
  name: string;
  songs: Array<Song>;
  constructor(name: string, songs: Array<Song>) {
    this.name = name;
    this.songs = songs;
  }
}
