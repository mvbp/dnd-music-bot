import { Playlist } from '../../models/Playlist';

export interface IPlaylistHelper {
  getPlaylistMap(): Map<string, Playlist>;
}
