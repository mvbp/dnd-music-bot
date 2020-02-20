import { Song } from '../../models/Song';
import { Playlist } from '../../models/Playlist';

export class PlaylistFactory {
  private name: string;
  private songs: Array<Song> = [];
  constructor(name) {
    this.name = name;
  }

  addSong(song: Song) {
    this.songs.push(song);
    return this;
  }

  build() {
    return new Playlist(this.name, this.songs);
  }
}
