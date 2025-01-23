import React from "react";
import "./App.css";

import NavBar from "./containers/navBar/navBar";
import MainSegment from "./containers/mainSegment/mainSegment";
import SearchResults from "./containers/searchResults/searchResults";
import SearchInput from "./functionality/searchInput";
import SpotifyApi from "./eiglAufServerSeite.js";

import { isEqual } from "lodash";

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      searchInput: "",
      connected: false,
      toDisplay: "savedPlaylists",
      updateCounter: 0 /*Delete when finished*/,
      initialized: false,
    };
    this.stateSetter = this.stateSetter.bind(this);
    this.fetchStuff = this.fetchStuff.bind(this);
  }

  async componentDidMount() {
    let savedPlaylists;
    let currentPlaylist;
    let newState = { ...this.state };
    await SpotifyApi.getUserId();
    if (localStorage.getItem("savedPlaylists")) {
      savedPlaylists = JSON.parse(localStorage.getItem("savedPlaylists"));
      currentPlaylist = savedPlaylists[0];
      newState.savedPlaylists = savedPlaylists;
      newState.currentPlaylist = currentPlaylist;
    }

    const accessToken = await sessionStorage.getItem("accessToken");
    if (accessToken) {
      const expirationTimer = await SpotifyApi.getExpirationTimer();
      newState.connected = true;
      newState.expirationTimer = expirationTimer;

      if (!localStorage.getItem("savedPlaylists")) {
        savedPlaylists = await SpotifyApi.getPlaylists();
        currentPlaylist = savedPlaylists[0];
        localStorage.setItem("savedPlaylists", JSON.stringify(savedPlaylists));
      }
    } else {
      try {
        const connected = await SpotifyApi.getAccessToken();
        const tokenExpiration = await SpotifyApi.getExpirationTimer();
        sessionStorage.setItem({
          connected: connected,
          expirationTimer: tokenExpiration,
        });
        newState.connected = connected;
        newState.expirationTimer = tokenExpiration;
      } catch (error) {
        console.log(error);
      }
    }

    if (!savedPlaylists) {
      savedPlaylists = [];
      currentPlaylist = {};
    }

    newState.savedPlaylists = savedPlaylists;
    newState.initialized = true;
    newState.updateCounter = newState.updateCounter + 1;
    newState.currentPlaylist = currentPlaylist ? currentPlaylist : {};
    this.setState(newState);
  }

  async componentDidUpdate(prevProps, prevState) {
    let newState = { ...this.state };
    if (!this.state.currentPlaylist && this.state.savedPlaylists.length > 0) {
      newState.currentPlaylist = this.state.savedPlaylists[0];
    }
    if (this.state.expirationTimer < performance.now()) {
      const connected = SpotifyApi.getAccessToken();
      const tokenExpiration = SpotifyApi.getExpirationTimer();
      newState.connected = connected;
      newState.expirationTimer = tokenExpiration;
    }

    if (!isEqual(newState, this.state)) {
      newState.updateCounter = newState.updateCounter + 1;
      this.setState(newState);
    }
  }

  stateSetter = async (updateObj) => {
    if (Object.keys(updateObj).includes("currentPlaylist")) {
      const index = this.state.savedPlaylists.findIndex(
        (entry) => entry.spotifyId === updateObj.currentPlaylist.spotifyId
      );
      if (
        !isEqual(this.state.savedPlaylists[index], updateObj.currentPlaylist)
      ) {
        SpotifyApi.updatePlaylistDetails(
          updateObj.currentPlaylist.spotifyId,
          updateObj.currentPlaylist
        );
      }
    }
    updateObj.updateCounter = this.state.updateCounter + 1;
    this.setState(updateObj);
  };

  fetchStuff = async () => {
    const tracks = await SpotifyApi.search(this.state.searchInput);
    this.setState({ searchResult: tracks, toDisplay: "currentPlaylist" });
  };

  updatePlaylist = (direction, track) => {
    const currentPlaylist = { ...this.state.currentPlaylist };
    const savedPlaylists = [...this.state.savedPlaylists];
    const playlistId = currentPlaylist.playlistId;
    if (direction === "add") {
      currentPlaylist.playlistTracks.push(track);
      currentPlaylist.playlistLength = currentPlaylist.playlistLength + 1;
      if (currentPlaylist.playlistLength > 0) {
        currentPlaylist.playlistImage = currentPlaylist.playlistTracks[0].image;
      }
      savedPlaylists[playlistId - 1] = currentPlaylist;

      this.setState({
        currentPlaylist: currentPlaylist,
        toDisplay: "currentPlaylist",
        savedPlaylists: savedPlaylists,
      });
      localStorage.setItem("savedPlaylists", JSON.stringify(savedPlaylists));
    } else {
      currentPlaylist.playlistTracks = currentPlaylist.playlistTracks.filter(
        (entry) => entry.id !== track.id
      );
      currentPlaylist.playlistLength = currentPlaylist.playlistLength - 1;
      if (currentPlaylist.playlistLength > 1) {
        currentPlaylist.playlistImage = currentPlaylist.playlistTracks[0].image;
      }
      savedPlaylists[playlistId - 1] = currentPlaylist;

      this.setState({
        currentPlaylist: currentPlaylist,
        toDisplay: "currentPlaylist",
        savedPlaylists: savedPlaylists,
      });
      localStorage.setItem("savedPlaylists", JSON.stringify(savedPlaylists));
    }

    return currentPlaylist;
  };

  addTrack = async (track) => {
    const newPlaylist = { ...this.state.currentPlaylist };
    newPlaylist.playlistTracks.push(track);
    await SpotifyApi.addTracksToPlaylist(newPlaylist.spotifyId, [track.uri]);
    this.setState({ currentPlaylist: newPlaylist });
  };

  render() {
    console.log("UPDATE COUNTER - app = ", this.state.updateCounter);
    console.log("Initialized - App = ", this.state.initialized);
    console.log("savedPlaylists - App = ", this.state.savedPlaylists);
    console.log("currentPlaylist - App = ", this.state.currentPlaylist);
    return (
      <>
        <NavBar stateSetter={this.stateSetter} />
        <SearchInput
          fetchStuff={() => this.fetchStuff()}
          searchInput={this.state.searchInput}
          stateSetter={this.stateSetter}
        ></SearchInput>
        {this.state.initialized ? (
          <div className="mainSegment">
            <MainSegment
              savedPlaylists={this.state.savedPlaylists}
              currentPlaylist={this.state.currentPlaylist}
              stateSetter={this.stateSetter}
              toDisplay={this.state.toDisplay}
              updatePlaylist={this.updatePlaylist}
            />
          </div>
        ) : (
          <div className="mainSegment">
            <h2>Loading...</h2>
          </div>
        )}
        <SearchResults
          currentPlaylist={this.state.currentPlaylist}
          tracks={this.state.searchResult}
          updatePlaylist={this.updatePlaylist}
          addTrack={this.addTrack}
        />
      </>
    );
  }
}

export default App;
