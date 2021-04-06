import React, { Component } from "react";
import './App.css';

import SongEventHandler from "./component/SongEventHandler"

import youtube, { baseTerms } from "./service/youtube";
import initialList from "./helper/subhanallah";

class App extends Component {
	state = {
		inputTerm: "",
		searchedFor: "",
		songs: initialList,
		selectedSong: null,
		songEvent: null,
		songState: null,
		buffering: true,
		playingFlag: false,
		muteFlag: false,
		volume: 50,
	}

	handleSongEvent = (c) => {
		this.setState({
			songEvent: c
		})
	}

	handleSongState = (event) => {
		let playerStatus = event.data,
			{ playingFlag, buffering } = this.state

		console.log(event)
		if (playerStatus === -1) { // unstarted
		} else if (playerStatus === 0) { // ended
			playingFlag = false
			buffering = true
		} else if (playerStatus === 1) { // playing
			playingFlag = true
			buffering = false
		} else if (playerStatus === 2) { // paused
			playingFlag = false
			buffering = false
		} else if (playerStatus === 3) { // buffering
			buffering = true
		} else if (playerStatus === 5) { // video cued
		}

		this.setState({
			songState: event,
			playingFlag,
			buffering
		})
	}

	handleInputChange = (event) => {
		this.setState({
			inputTerm: event.target.value,
		});
	};

	handleSearchSong = async (event) => {
		event.preventDefault()

		let songs = [...this.state.songs],
			inputTerm = this.state.inputTerm.toLowerCase(),
			searchedFor = this.state.searchedFor

		if (inputTerm !== "") {
			songs = await this.searchSong(inputTerm)
			searchedFor = inputTerm
		}

		this.setState({
			inputTerm: "",
			songs,
			searchedFor,
		});
	};

	handleVolume = async (event) => {
		this.setState({ volume: parseInt(event.target.value) })
		const { songEvent } = this.state;
		if (songEvent != null) {
			songEvent.target.setVolume(parseInt(event.target.value))
		}
	}

	handlePlay = async (event) => {
		event.preventDefault()
		let playingFlag = this.state.playingFlag,
			selectedSong = this.state.selectedSong

		playingFlag ?
			this.pauseSong() :
			(this.resumeSong() ?
				console.log(`Resuming ${selectedSong.snippet.title}`) :
				alert("No music on the list"))
	}

	handleStop = async (event) => {
		event.preventDefault()
		this.stopSong() ?
			this.setState({ selectedSong: null, songEvent: null, playingFlag: false }) :
			alert("No music to stop")
	}

	searchSong = async (inputTerm) => {
		const response = await youtube.get("/search", {
			params: {
				...baseTerms,
				q: inputTerm,
			},
		});
		return response.data.items;
	}

	pauseSong = () => {
		const { songEvent } = this.state;
		if (songEvent != null) {
			songEvent.target.pauseVideo()
			this.setState({
				playingFlag: false
			})
		}
	}

	resumeSong = () => {
		const { songEvent } = this.state;
		if (songEvent != null) {
			songEvent.target.playVideo()
			this.setState({ playingFlag: true })
			return true
		}
		return false
	}

	stopSong() {
		const { songEvent } = this.state
		if (songEvent != null) {
			songEvent.target.stopVideo()
			return true
		}
		return false
	}

	playSong = (index) => {
		let selectedSong = { ...this.state.selectedSong };
		let songs = [...this.state.songs];
		const songEvent = this.state.songEvent;

		selectedSong = { ...songs[index] }
		if (songEvent != null) {
			songEvent.target.loadVideoById(selectedSong.id.videoId)
		}

		this.setState({
			selectedSong,
			songs,
			playingFlag: true,
			// volume: songEvent.target.getVolume()
		});
	}

	render() {
		const {
			inputTerm,
			songs,
			selectedSong,
			playingFlag,
			buffering,
			volume,
			songEvent,
			searchedFor
		} = this.state;

		const {
			title,
			thumbnails,
			channelTitle,
		} = selectedSong != null ? selectedSong.snippet : {};
		const imageURl = selectedSong != null ? thumbnails.medium.url : "";

		return (
			<div>
				<div className="player">
					<div className="banner">
						<div className="widthNormaliser">
							<div
								className={buffering ? "buffering albumCover" : "albumCover"}
								style={{ backgroundImage: "url(" + imageURl + ")" }}>
							</div>
							<div className="information">
								<div className={buffering ? "buffering title" : "title"}>{selectedSong ? title : String.fromCharCode("nbsp")}</div>
								<div className={buffering ? "buffering publisher" : "publisher"}>{selectedSong ? "by " + channelTitle : String.fromCharCode("nbsp")}</div>
								{selectedSong != null && (
									<SongEventHandler
										song={selectedSong}
										onSongEvent={(c) => this.handleSongEvent(c)}
										onSongState={(c) => this.handleSongState(c)}
									/>
								)}
								<div className="controls">
									<button disabled={songEvent == null}>
										&#x23EE;
									</button>

									<button
										disabled={songEvent == null}
										onClick={this.handlePlay}
									>
										{playingFlag ? String.fromCharCode("0x23F8") : "▶️"}
									</button>

									<button disabled={songEvent == null}>
										&#x23ED;
									</button>
								</div>
							</div>
						</div>
					</div>

					<div className="volumeControls">
						<div className="widthNormaliser">
							<div className="controls">
								<button>🔈</button>
								<input
									disabled={songEvent == null}
									name="command-input"
									type="range"
									min="1" max="100" step="5"
									value={volume}
									onChange={this.handleVolume}
								/>
								<button>🔊</button>
							</div>
						</div>
					</div>
				</div>

				<div className="songsArea">
					<div className="widthNormaliser">
						<div className="header">
							<div>{searchedFor === "" ? String.fromCharCode("nbsp") : "Results for: " + searchedFor}</div>
							<form onSubmit={this.handleSearchSong}>
								<input
									onChange={this.handleInputChange}
									value={inputTerm}
									name="command-input"
									type="text"
									placeholder="Search for a song here"
									autoFocus
								/>
								<input
									value="Search"
									type="submit"
								/>
							</form>
						</div>

						<table>
							<tbody>
								{songs.map((song, index) => (
									<tr key={index} onClick={this.playSong.bind(this, index)}>
										<td>&#x2764;</td>
										<td>{index + 1}</td>
										<td>{unescape(song.snippet.title)}</td>
										<td>{song.snippet.channelTitle}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

			</div>
		);
	}
}

export default App;
