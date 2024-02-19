import React from 'react';
import './App.css';

import NavBar from './containers/navBar/navBar'
import MainSegment from './containers/mainSegment/mainSegment'
import SearchResults from './containers/searchResults/searchResults'
import SearchInput from './functionality/searchInput'
import SpotifyApi from './eiglAufServerSeite.js'

class App extends React.Component{
  constructor(){
    super();
    this.state = {
      searchInput : "",
      connected : false,
      toDisplay:"",
      updateSavedPlaylists:false,
    };
    this.stateSetter = this.stateSetter.bind(this)
    this.fetchStuff = this.fetchStuff.bind(this)
  }

  async componentDidMount(){
    let savedPlaylists
    let currentPlaylist
    SpotifyApi.getUserId();
    if(localStorage.getItem("savedPlaylists")){
      savedPlaylists = JSON.parse(localStorage.getItem("savedPlaylists"));
      currentPlaylist = savedPlaylists[0];
      this.setState({savedPlaylists:savedPlaylists, currentPlaylist:currentPlaylist});
    }else{
      savedPlaylists = [];
      this.setState({savedPlaylists:savedPlaylists});
    }
    const accessToken = sessionStorage.getItem("accessToken");
    if(accessToken){
      const expirationTimer = SpotifyApi.getExpirationTimer();
      this.setState({connected: true, expirationTimer: expirationTimer});
    }else {
      const connected = SpotifyApi.getAccessToken();
      const tokenExpiration =  SpotifyApi.getExpirationTimer();
      sessionStorage.setItem({"connected":connected, expirationTimer:tokenExpiration});
    }
  }

  async componentDidUpdate(prevState){
    console.log(this.state.expirationTimer);
    console.log(performance.now())
    if(!this.state.currentPlaylist && this.state.savedPlaylists.length > 0){
      this.setState({currentPlaylist: this.state.savedPlaylists[0]});
    }
    if(!this.state.expirationTimer){
      const tokenExpiration = SpotifyApi.getExpirationTimer();
      this.setState({expirationTimer: tokenExpiration});
    }else if(this.state.expirationTimer < performance.now()){
      const connected = SpotifyApi.getAccessToken();
      const tokenExpiration =  SpotifyApi.getExpirationTimer();
      this.setState({expirationTimer: tokenExpiration, connected:connected});
    }

    if(this.state.updateSavedPlaylists){
      const savedPlaylists = [...this.state.savedPlaylists];
      const playlistId = this.state.currentPlaylist.playlistId;
      for(let i = 0 ; i < savedPlaylists.length; i++){
        if(this.state.currentPlaylist && savedPlaylists[i].playlistId === playlistId){
          savedPlaylists[i] = this.state.currentPlaylist;
          break;
        }
      }
      this.setState({savedPlaylists:savedPlaylists, updateSavedPlaylists:false});
      localStorage.setItem("savedPlaylists", JSON.stringify(savedPlaylists));
    }
  }

  stateSetter = async (updateObj) =>{
    this.setState(updateObj);
  }

  fetchStuff = async () => {
    const tracks = await SpotifyApi.search(this.state.searchInput);
    this.setState({searchResult: tracks, toDisplay:"currentPlaylist"});
  }

  updatePlaylist = (direction,track) =>{
    const currentPlaylist = {...this.state.currentPlaylist}
    const savedPlaylists = [...this.state.savedPlaylists];
    const playlistId = currentPlaylist.playlistId;
    if(direction === "add"){
      currentPlaylist.playlistTracks.push(track);
      currentPlaylist.playlistLength = currentPlaylist.playlistLength + 1;
      if(currentPlaylist.playlistLength > 0){
        currentPlaylist.playlistImage = currentPlaylist.playlistTracks[0].image;
      }
      savedPlaylists[playlistId-1] = currentPlaylist;
      
      this.setState({currentPlaylist:currentPlaylist, toDisplay:"currentPlaylist", savedPlaylists:savedPlaylists});
      localStorage.setItem("savedPlaylists", JSON.stringify(savedPlaylists));
    }else{
      currentPlaylist.playlistTracks = currentPlaylist.playlistTracks.filter(entry => entry.id !== track.id);
      currentPlaylist.playlistLength = currentPlaylist.playlistLength - 1;
      if(currentPlaylist.playlistLength > 1){
        currentPlaylist.playlistImage = currentPlaylist.playlistTracks[0].image;
      }
      savedPlaylists[playlistId-1] = currentPlaylist;
      
      this.setState({currentPlaylist:currentPlaylist, toDisplay:"currentPlaylist", savedPlaylists:savedPlaylists});
      localStorage.setItem("savedPlaylists", JSON.stringify(savedPlaylists));
    }
  }

  render(){

    return(
      <>
        <NavBar 
          stateSetter={this.stateSetter}
        />
        <SearchInput fetchStuff={() =>this.fetchStuff()} searchInput={this.state.searchInput} stateSetter={this.stateSetter}></SearchInput>
        <MainSegment 
          savedPlaylists={this.state.savedPlaylists}
          currentPlaylist={this.state.currentPlaylist}
          stateSetter={this.stateSetter}
          toDisplay={this.state.toDisplay}
          updatePlaylist={this.updatePlaylist}
        />
        <SearchResults 
          currentPlaylist={this.state.currentPlaylist} 
          tracks={this.state.searchResult}
          updatePlaylist={this.updatePlaylist} 
        />
      </>)
  }
}

export default App;
