export class Song {
  title: string;
  artist: string;
  length: number;
  url: string;
  constructor(title: string, artist: string, length: number, url: string) {
    this.title = title;
    this.artist = artist;
    this.length = length;
    this.url = url;
  }
}
