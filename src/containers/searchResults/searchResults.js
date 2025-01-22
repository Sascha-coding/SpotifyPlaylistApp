import React from "react";
import styles from "./searchResults.module.css";
import Track from "./Track";

const SearchResults = (props) => {
  const saved = (track) => {
    for (let value of props.currentPlaylist.playlistTracks) {
      if (value.id === track.id) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className={styles.searchResults}>
      <h1 className={styles.h1}>Search Results</h1>
      {props.tracks
        ? props.tracks.map((track, index) => (
            <Track
              search={true}
              updatePlaylist={props.updatePlaylist}
              key={track.name + "-" + index}
              track={track}
              disabled={
                props.currentPlaylist.playlistTracks.length > 0
                  ? saved(track)
                  : false
              }
            />
          ))
        : null}
    </div>
  );
};

export default SearchResults;
