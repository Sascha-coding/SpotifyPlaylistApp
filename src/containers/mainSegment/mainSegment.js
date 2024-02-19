import React from "react";

import CurrentPlaylist from './mainSegments/currentPlaylist'
import SavedPlaylists from './mainSegments/savedPlaylists'
import CreateNewPlaylist from './mainSegments/createNewPlaylist'
import styles from './mainSegment.module.css'

import dateFormater from "../../functionality/dateFormater"
import { isEqual } from "lodash";

import SpotifyApi from "../../eiglAufServerSeite";

class MainSegment extends React.Component{
    constructor(props){
        super();
        this.state = {
            savedPlaylists: [],
            currentPlaylist: "",
            toDisplay:props.toDisplay ? props.toDisplay : "",
        }
        this.updateSavedPlaylists = this.updateSavedPlaylists.bind(this);
        this.selectPlaylist = this.selectPlaylist.bind(this);
    }
    componentDidMount(){
        let savedPlaylists = [
            
        ];
        let localStorageEmpty = true;
        if(isEqual(this.state.savedPlaylists,savedPlaylists)){
            if(localStorage.getItem("savedPlaylists")){
                savedPlaylists = JSON.parse(localStorage.getItem("savedPlaylists"));
                localStorageEmpty = false;
            } 
        }
        if(!localStorageEmpty){
            const currentPlaylist = savedPlaylists[0]
            this.setState({savedPlaylists:savedPlaylists, currentPlaylist:currentPlaylist});
        }    
    }
    componentDidUpdate(prevProps,prevState){

        if(!isEqual(prevProps.savedPlaylists,this.props.savedPlaylists)){
            this.setState({savedPlaylists: this.props.savedPlaylists})
        }
        if(prevState.toDisplay !== this.props.toDisplay){
            this.setState({toDisplay: this.props.toDisplay})
        }
        if(this.props.currentPlaylist && this.props.currentPlaylist.playlistTracks){
            if(this.props.currentPlaylist.playlistLength !== this.state.currentPlaylist.playlistLength){
                this.setState({currentPlaylist: this.props.currentPlaylist})
            }
        }
    }
    updateSavedPlaylists = (direction, playlist,event) => {
        event.preventDefault();
        const savedPlaylists = [...this.state.savedPlaylists];
        if(direction === "add"){
            playlist.playlistCreation = dateFormater();
            playlist.playlistLength = 0;
            savedPlaylists.push(playlist);
        }else{
            
        }
        this.setState({savedPlaylists:savedPlaylists});
        this.props.stateSetter({savedPlaylists:savedPlaylists});
        localStorage.setItem("savedPlaylists",JSON.stringify(savedPlaylists))
    }

    stateSetter = async(updateObj) => {
        this.setState(updateObj)
    }

    selectPlaylist = (playlist) =>{
        this.setState({currentPlaylist:playlist, toDisplay:"currentPlaylist"});
        const updateObj = {currentPlaylist:playlist}
        this.props.stateSetter(updateObj);
        this.props.stateSetter({toDisplay:"currentPlaylist"});
    }

    addToSpotify = (playlist) =>{
        SpotifyApi.exportPlaylist(playlist);
    }

    render(){
        return(
            <div className={styles.mainSegment}>
                {this.state.toDisplay === "currentPlaylist" ? <CurrentPlaylist addToSpotify={this.addToSpotify} playlist = {this.props.currentPlaylist} updatePlaylist={this.props.updatePlaylist} stateSetter={this.props.stateSetter}/>
                :this.state.toDisplay === "savedPlaylists" ?<SavedPlaylists  savedPlaylists={this.state.savedPlaylists} selectPlaylist={this.selectPlaylist} stateSetter={this.props.stateSetter}/>
                :this.state.toDisplay === "createNewPlaylist" ?<CreateNewPlaylist updateSavedPlaylists={this.updateSavedPlaylists} savedPlaylists={this.state.savedPlaylists}/> 
                :null}
            </div>
        )
    }
}
export default MainSegment