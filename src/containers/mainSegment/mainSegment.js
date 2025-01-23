import React from "react";

import CurrentPlaylist from "./mainSegments/currentPlaylist";
import SavedPlaylists from "./mainSegments/savedPlaylists";
import CreateNewPlaylist from "./mainSegments/createNewPlaylist";
import "./mainSegment.module.css";

import dateFormater from "../../functionality/dateFormater";
import { isEqual } from "lodash";

import SpotifyApi from "../../eiglAufServerSeite";

class MainSegment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      savedPlaylists: this.props.savedPlaylists
        ? this.props.savedPlaylists
        : [],
      currentPlaylist: this.props.currentPlaylist
        ? this.props.currentPlaylist
        : {},
      toDisplay: props.toDisplay ? props.toDisplay : "savedPlaylists",
      updateCounter: 0,
    };
    this.updateSavedPlaylists = this.updateSavedPlaylists.bind(this);
    this.selectPlaylist = this.selectPlaylist.bind(this);
  }
  componentDidMount() {}
  componentDidUpdate(prevProps, prevState) {
    const newState = { ...this.state };
    if (!isEqual(prevProps.savedPlaylists, this.props.savedPlaylists)) {
      newState.savedPlaylists = this.props.savedPlaylists;
      localStorage.setItem(
        "savedPlaylists",
        JSON.stringify(this.props.savedPlaylists)
      );
    }

    if (newState.toDisplay !== this.props.toDisplay) {
      newState.toDisplay = this.props.toDisplay;
    }
    if (
      this.props.currentPlaylist &&
      this.props.currentPlaylist.playlistTracks &&
      !isEqual(this.props.currentPlaylist, prevProps.currentPlaylist)
    ) {
      newState.currentPlaylist = this.props.currentPlaylist;
    }

    if (!isEqual(newState, this.state)) {
      newState.updateCounter = newState.updateCounter + 1;
      this.setState(newState);
    }
  }

  updateSavedPlaylists = (direction, playlist) => {
    const savedPlaylists = [...this.state.savedPlaylists];
    if (direction === "add") {
      playlist.playlistCreation = dateFormater();
      playlist.playlistLength = 0;
      savedPlaylists.push(playlist);
    } else if (direction === "update") {
      const index = savedPlaylists.findIndex(
        (entry) => entry.spotifyId === playlist.spotifyId
      );
      console.log("index = ", index);
      console.log(
        "length changed =",
        playlist.playlistTracks.length ===
          savedPlaylists[index].playlistTracks.length
      );
      if (index !== -1) {
        savedPlaylists[index] = playlist;
      }
    }

    const updateObj = {
      savedPlaylists: savedPlaylists,
      currentPlaylist: playlist,
    };

    this.props.stateSetter(updateObj);
  };

  selectPlaylist = (playlist) => {
    console.log("playlist = ", playlist);
    const updateObj = {
      currentPlaylist: playlist,
      toDisplay: "currentPlaylist",
    };
    this.props.stateSetter(updateObj);
  };

  addToSpotify = (playlist) => {
    SpotifyApi.exportPlaylist(playlist);
  };

  render() {
    console.log("UPDATE COUNTER - mainSegment = ", this.state.updateCounter);
    console.log("toDisplay - mainSegment = ", this.state.toDisplay);
    return (
      <>
        {this.state.toDisplay === "currentPlaylist" ? (
          <CurrentPlaylist
            addToSpotify={this.addToSpotify}
            playlist={this.props.currentPlaylist}
            updatePlaylist={this.props.updatePlaylist}
            updateSavedPlaylists={this.updateSavedPlaylists}
            stateSetter={this.props.stateSetter}
          />
        ) : this.state.toDisplay === "savedPlaylists" ? (
          <SavedPlaylists
            savedPlaylists={this.state.savedPlaylists}
            selectPlaylist={this.selectPlaylist}
            stateSetter={this.props.stateSetter}
          />
        ) : this.state.toDisplay === "createNewPlaylist" ? (
          <CreateNewPlaylist
            updateSavedPlaylists={this.updateSavedPlaylists}
            savedPlaylists={this.state.savedPlaylists}
          />
        ) : null}
      </>
    );
  }
}
export default MainSegment;
