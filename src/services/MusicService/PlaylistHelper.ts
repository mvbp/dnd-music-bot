import { PlaylistFactory } from './PlaylistFactory';
import { playlists } from './playlists';
import { Song } from '../../models/Song';
import { Playlist } from '../../models/Playlist';

export class PlaylistHelper {
  private playlistMap: Map<string, Playlist> = new Map();
  constructor() {
    playlists.forEach(playlist => {
      const factory = new PlaylistFactory(playlist.name);
      playlist.songs.forEach(song => {
        if (song != null) {
          factory.addSong(
            new Song(song.title, song.artist, song.length, playlist.name)
          );
        }
      });
      this.playlistMap.set(playlist.name, factory.build());
    });
  }
  getPlaylistMap(): Map<string, Playlist> {
    return this.playlistMap;
  }
}
