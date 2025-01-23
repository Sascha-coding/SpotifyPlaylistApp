import React from "react";
import styles from "./searchResults.module.css";

function Track(props) {
  return (
    <>
      <div className={styles.track}>
        {props.search ? (
          <audio
            className={styles.player}
            src={props.track.preview}
            controls
          ></audio>
        ) : (
          <span>{props.index}.</span>
        )}
        <div className={styles.trackInfo}>
          <img
            src={props.track.image}
            alt={props.track.name}
            className={styles.trackImage}
          />
          <span className={styles.span}>Song: {props.track.name}</span>
          <span className={styles.span}>Album: {props.track.album}</span>
          <span className={styles.span}>Released: {props.track.released}</span>
          <span className={styles.span}>Artist: {props.track.artist}</span>
        </div>
        {props.search ? (
          <>
            <button
              disabled={props.disabled}
              className={styles.button}
              onClick={
                props.search
                  ? (e) => {
                      props.addTrack(props.track, e);
                    }
                  : (e) => props.updatePlaylistTracks("add", props.track)
              }
            >
              +
            </button>
            <hr className={styles.hr}></hr>
          </>
        ) : (
          <>
            <button
              className={styles.button}
              onClick={(e) => props.updatePlaylistTracks("remove", props.track)}
            >
              -
            </button>
            <hr className={styles.hr2}></hr>
          </>
        )}
      </div>
    </>
  );
}

export default Track;
