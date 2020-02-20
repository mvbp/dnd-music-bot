export class Song {
  title: string;
  artist: string;
  length: number;
  songPath: string;
  constructor(
    title: string,
    artist: string,
    length: number,
    playlistName: string
  ) {
    this.title = title;
    this.artist = artist;
    this.length = length;
    this.songPath = `music/${playlistName}/${title}.ogg`;
  }
}
