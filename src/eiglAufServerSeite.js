import { toNumber } from "lodash";
import dateFormater from "./functionality/dateFormater";
const clientKey = "6a0320cacbef48db91a6e5b4a52bbfb7";
const redirectUrl = "https://musicmusicmusic123.netlify.app/";

class Spotifyy {
  constructor() {
    this.accessToken = sessionStorage.getItem("accessToken");
    this.expiresIn = sessionStorage.getItem("expiresIn");
    this.tokenType = sessionStorage.getItem("tokenType");
  }

  getAccessToken = () => {
    const accessTokenUrl = `https://accounts.spotify.com/authorize?client_id=${clientKey}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUrl}`;
    let accessToken,
      tokenType,
      expiresIn,
      connected = false;

    window.location.href = accessTokenUrl;
    const urlParts = window.location.href.split("&");
    connected = true;
    accessToken = urlParts[0].split("access_token=")[1];
    tokenType = urlParts[1].split("=")[1];
    expiresIn = urlParts[2].split("=")[1] * 1000;
    sessionStorage.setItem("accessToken", accessToken);
    sessionStorage.setItem("expiresIn", expiresIn);
    sessionStorage.setItem("tokenType", tokenType);

    return connected;
  };
  getUserId = async () => {
    const accessToken = sessionStorage.getItem("accessToken");
    await fetch(`https://api.spotify.com/v1/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then(async (response) => {
      const data = await response.json();
      sessionStorage.setItem("userId", data.id);
    });
  };

  getExpirationTimer = () => {
    const expiresIn = sessionStorage.getItem("expiresIn");
    const timer = toNumber(performance.now()) + toNumber(expiresIn);
    return timer;
  };

  search = async (query) => {
    const accessToken = sessionStorage.getItem("accessToken");
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${query}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();
        return data;
      })
      .then((data) => {
        if (!data.tracks) {
          return [];
        } else {
          return data.tracks.items.map((track) => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            image: track.album.images[0].url,
            preview: track.preview_url,
            released: track.album.release_date,
            uri: track.uri,
          }));
        }
      });
  };

  exportPlaylist = async (playlist) => {
    const accessToken = sessionStorage.getItem("accessToken");
    const UserId = sessionStorage.getItem("userId");
    const trackUris = playlist.playlistTracks.map((track) => track.uri);

    let playlists = await fetch(
      `https://api.spotify.com/v1/users/${UserId}/playlists`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    ).then(async (response) => {
      const data = await response.json();
      return data.items;
    });

    const existingPlaylist = await playlists.filter(
      (item) => playlist.spotifyId === item.id
    );
    let playlistId =
      existingPlaylist.length > 0
        ? existingPlaylist[0].id
        : await this.createNewPlaylist(playlist);

    if (existingPlaylist.length > 0) {
      let tracks = await this.getTracks(existingPlaylist[0]);
      let snapShotId = existingPlaylist[0].snapshot_id;
      let existingUris = await tracks.map((track) => track.track.uri);
      let tracksToAdd = await trackUris.filter(
        (track) =>
          !existingUris.some((existingTrack) => existingTrack === track)
      );
      let tracksToRemove = await existingUris
        .map((track) => (trackUris.indexOf(track) === -1 ? track : null))
        .filter((track) => track !== null);
      if (tracksToRemove.length > 0) {
        await this.removeTracks(playlistId, tracksToRemove, snapShotId);
      }
      if (tracksToAdd.length > 0) {
        await this.addTracks(playlistId, tracksToAdd, snapShotId);
      }
    } else {
      await this.addTracks(playlistId, trackUris);
    }
  };

  removeTracks = async (playlistId, trackUris, snapshot) => {
    const accessToken = sessionStorage.getItem("accessToken");
    await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tracks: [
          {
            uri: trackUris.join(","),
          },
        ],
        snapshot_id: snapshot,
      }),
    }).then(async (response) => {
      await response.json();
    });
  };

  addTracks = async (playlistId, trackUris, snapshot) => {
    const accessToken = sessionStorage.getItem("accessToken");
    await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?uris=${trackUris.join(
        ","
      )}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        data: {
          tracks: [
            {
              uri: trackUris.join(","),
            },
          ],
          snapshot_id: snapshot,
        },
      }
    ).then(async (response) => {
      await response.json();
    });
  };
  createNewPlaylist = async (playlist) => {
    const accessToken = sessionStorage.getItem("accessToken");
    const UserId = sessionStorage.getItem("userId");

    const newPlaylist = await fetch(
      `https://api.spotify.com/v1/users/${UserId}/playlists`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: playlist.playlistName,
          description: playlist.playlistDescription,
          public: true,
        }),
      }
    ).then(async (response) => {
      const data = await response.json();
      return data.id;
    });
    return newPlaylist;
  };

  getTracks = async (playlist) => {
    const accessToken = sessionStorage.getItem("accessToken");
    const tracks = await fetch(
      `https://api.spotify.com/v1/playlists/${playlist.id}/tracks?&limit=100`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    ).then(async (response) => {
      const data = await response.json();
      return data.items;
    });
    return tracks;
  };
  getPlaylists = async () => {
    const accessToken = sessionStorage.getItem("accessToken");
    const UserId = sessionStorage.getItem("userId");
    let savedPlaylists = JSON.parse(localStorage.getItem("savedPlaylists"));
    if (!savedPlaylists) {
      savedPlaylists = [];
    }
    let playlists = await fetch(
      `https://api.spotify.com/v1/users/${UserId}/playlists`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    ).then(async (response) => {
      const data = await response.json();
      console.log(data);
      return data;
    });
    let result = await playlists.items
      .filter((playlist) => playlist.tracks.total !== 0)
      .map(async (playlist) => {
        let playlistObj = {
          playlistId: savedPlaylists.length,
          playlistName: playlist.name,
          playlistGenre: "",
          playlistTracks: [],
          playlistLength: playlist.tracks.total,
          playlistDescription: playlist.description,
          playlistCreation: dateFormater(),
          spotifyId: playlist.id,
        };
        for (let i = 0; i < playlist.tracks.total; i += 100) {
          await fetch(
            `https://api.spotify.com/v1/playlists/${playlist.id}/tracks?offset=${i}&limit=100`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          ).then(async (response) => {
            let data = await response.json();
            data = data.items;

            await data.map((track) => {
              track = track.track;
              let artists = track.artists;
              let artistString = artists.map((artist) => artist.name).join(",");

              let trackObj = {
                id: track.id,
                name: track.name,
                artist: artistString,
                album: track.album.name,
                image: track.album.images[0].url,
                preview: track.preview_url,
                released: track.album.release_date,
                uri: track.uri,
              };
              playlistObj.playlistTracks.push(trackObj);
              return true;
            });
          });
        }

        playlistObj.playlistId = savedPlaylists.length + 1;
        playlistObj["playlistImage"] =
          playlistObj.playlistTracks.length > 0
            ? playlistObj.playlistTracks[0].image
            : "";
        savedPlaylists.push(playlistObj);
      });

    let syncedPlaylists = await Promise.all(result).then(() => {
      return savedPlaylists;
    });
    localStorage.setItem("savedPlaylists", JSON.stringify(syncedPlaylists));
    return syncedPlaylists;
  };

  updatePlaylistDetails = async (playlistId, updatedPlaylist) => {
    const updatedPlaylistDetails = {
      name: updatedPlaylist.playlistName,
      description: updatedPlaylist.playlistGenre,
      tracks: updatedPlaylist.playlistTracks,
      id: updatedPlaylist.spotifyId,
    };
    const accessToken = sessionStorage.getItem("accessToken");
    console.log("updatedDetails on PUT = ", updatedPlaylistDetails);
    if (!accessToken) {
      console.error("No access token found");
      return;
    }

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedPlaylistDetails),
        }
      );

      if (response.ok) {
      } else {
        console.error("Failed to update playlist");
      }
    } catch (error) {
      console.error("Error updating playlist", error);
    }
  };
  async addTracksToPlaylist(playlistId, trackUris) {
    const accessToken = sessionStorage.getItem("accessToken");

    if (!accessToken) {
      console.error("No access token found");
      return;
    }

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uris: trackUris }),
        }
      );

      if (response.ok) {
        console.log("Tracks added successfully");
      } else {
        const errorData = await response.json();
        console.error("Failed to add tracks", errorData);
      }
    } catch (error) {
      console.error("Error adding tracks", error);
    }
  }

  async removeTracksFromPlaylist(playlistId, trackUris) {
    const accessToken = sessionStorage.getItem("accessToken");

    if (!accessToken) {
      console.error("No access token found");
      return;
    }

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tracks: trackUris.map((uri) => ({ uri })) }),
        }
      );

      if (response.ok) {
        console.log("Tracks removed successfully");
      } else {
        const errorData = await response.json();
        console.error("Failed to remove tracks", errorData);
      }
    } catch (error) {
      console.error("Error removing tracks", error);
    }
  }
}
const SpotifyApi = new Spotifyy();
export default SpotifyApi;

/*
/#access_token=BQAyk-nt9yBs4iMYQsFp6-kegNJiqSKOIj4H2O72MxIHSzGxKQ110yTifcSnghRQ5hKLmvWahviOmKe4XtFjzyap-sTtBNpOcgyXs5vNkM0E4IwY2KM-lyKXcQHtH2ybgF1_osyU0Qd2foBIy8v-ScDuES-gzvnOvMLx7-_bP5Ptq8pTxf7vx7cWBBas3_o9I_G9fCZbOKA
&token_type=Bearer
&expires_in=3600
*/
