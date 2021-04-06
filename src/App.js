import React, { Component } from "react";
import './App.css';

import SongEventHandler from "./component/SongEventHandler"

import youtube, { baseTerms } from "./service/youtube";
import initialList from "./helper/initialList";

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
		volume: 100,
		currentPlaying: -1,
	}

	handleSongEvent = (c) => {
		this.setState({
			songEvent: c
		})
	}

	handleSongState = (event) => {
		let playerStatus = event.data,
			{ playingFlag, buffering, currentPlaying } = this.state

		if (playerStatus === -1) { // unstarted
		} else if (playerStatus === 0) { // ended
			currentPlaying = -1
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
			buffering,
			currentPlaying
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
			currentPlaying: -1,
		});
	};

	handleVolume = async (event) => {
		this.setState({ volume: parseInt(event.target.value) })
		const { songEvent } = this.state;
		if (songEvent != null) {
			songEvent.target.setVolume(parseInt(event.target.value))
		}
	}

	handleMute = (vol) => {
		this.setState({ volume: vol })
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
			this.setState({ selectedSong: null, songEvent: null, playingFlag: false, currentPlaying: -1 }) :
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

	prevSong = () => {
		let { songs, currentPlaying } = this.state
		if (currentPlaying !== -1) {
			currentPlaying = currentPlaying === 0 ? songs.length - 1 : currentPlaying - 1
			this.playSong(currentPlaying)
			this.setState({
				currentPlaying,
			})
		}
	}

	nextSong = () => {
		let { songs, currentPlaying } = this.state
		if (currentPlaying !== -1) {
			currentPlaying = (currentPlaying + 1) % songs.length
			this.playSong(currentPlaying)
			this.setState({
				currentPlaying,
			})
		}
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
			currentPlaying: index,
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
			searchedFor,
			currentPlaying,
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
								style={{ backgroundImage: "url(" + imageURl + "), url('https://avatars.githubusercontent.com/u/41644472?v=4')" }}
							></div>
							<div className="information">
								<div className={buffering ? "buffering title" : "title"}>{selectedSong ? title : "MyPod"}</div>
								<div className={buffering ? "buffering publisher" : "publisher"}>{selectedSong ? "by " + channelTitle : "by Faisal"}</div>
								{selectedSong != null && (
									<SongEventHandler
										song={selectedSong}
										onSongEvent={(c) => this.handleSongEvent(c)}
										onSongState={(c) => this.handleSongState(c)}
									/>
								)}
								<div className="controls">
									<button
										disabled={songEvent == null}
										onClick={this.prevSong}
									>&#x23EE;
									</button>

									<button
										disabled={songEvent == null}
										onClick={this.handlePlay}
									>{playingFlag ? String.fromCharCode("0x23F8") : "▶️"}
									</button>

									<button
										disabled={songEvent == null}
										onClick={this.nextSong}
									>&#x23ED;
									</button>
								</div>
							</div>
						</div>
					</div>

					<div className="volumeControls">
						<div className="widthNormaliser">
							<div className="controls">
								<button
									disabled={songEvent == null}
									onClick={this.handleMute.bind(this, 0)}
								>🔈</button>
								<input
									disabled={songEvent == null}
									name="command-input"
									type="range"
									min="1" max="100" step="5"
									value={volume}
									onChange={this.handleVolume}
								/>
								<button
									disabled={songEvent == null}
									onClick={this.handleMute.bind(this, 100)}
								>🔊</button>
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
									placeholder="Search for any song here"
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
									<tr
										key={index}
										onClick={this.playSong.bind(this, index)}
										className={`${currentPlaying === index ? "playing" : ""}`}
									>
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
