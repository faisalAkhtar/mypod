import React, { Component } from "react";
import './App.css';

import SongEventHandler from "./component/SongEventHandler"

import youtube, { baseTerms } from "./service/youtube";

class App extends Component {
	state = {
		inputTerm: "",
		songs: [],
		selectedSong: null,
		songEvent: null,
		playingFlag: false,
		muteFlag: false
	}

	handleSongEvent = (c) => {
		this.setState({
			songEvent: c
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
			inputTerm = this.state.inputTerm.toLowerCase()

		if (inputTerm !== "") {
			songs = await this.searchSong(inputTerm)
		}

		this.setState({
			inputTerm: "",
			songs,
		});
	};

	handleVolume = async (event) => {
		event.preventDefault()
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

	setVolume = (volume) => {
		const { songEvent } = this.state;
		if (songEvent != null) {
			songEvent.target.setVolume(volume)
		}
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
			playingFlag: true
		});
	}

	render() {
		const {
			inputTerm,
			songs,
			selectedSong,
			playingFlag
		} = this.state;

		const {
			title,
			thumbnails,
			channelTitle,
		} = selectedSong != null ? selectedSong.snippet : {};
		const imageURl = selectedSong != null ? thumbnails.medium.url : "";

		return (
			<div className="APP">
				<div className="FORM">
					<form onSubmit={this.handleSearchSong}>
						<input
							onChange={this.handleInputChange}
							name="command-input"
							type="text"
							placeholder="Search for a song here"
							value={inputTerm}
							autoFocus
						/>
						<input
							placeholder="SUBMIT"
							type="submit"
						/>
					</form>
				</div>
				<div className="PLAYER">
					{
						selectedSong &&
						<div className="DETAILS">
							<div className="Header">
								<div className="Title">Now Playing</div>
							</div>
							<div className="Artwork">
								<img src={imageURl} alt={title} />
							</div>
							<div className="TrackInformation">
								<div className="Name">{title}</div>
								<div className="Artist">{channelTitle}</div>
							</div>
							{selectedSong != null && (
								<SongEventHandler song={selectedSong} onSongEvent={(c) => this.handleSongEvent(c)} />
							)}
						</div>
					}
					<div className="CONTROLS">
						<button onClick={this.handleVolume}>
							VOLUME
						</button>
						<button onClick={this.handlePlay}>
							{playingFlag ? 'PAUSE' : 'PLAY'}
						</button>
						<button onClick={this.handleStop}>
							STOP
						</button>
					</div>
				</div>
				<div className="SONGS">
					{
						songs.length > 0 &&
						<table style={{ borderCollapse: 'collapse', margin: 'auto' }}>
							<tr>
								<th>SNo</th>
								<th>Title</th>
								<th>Published By</th>
							</tr>
							{songs.map((song, index) => (
								<tr key={song.id.songId} onClick={this.playSong.bind(this, index)}>
									<td>{index + 1}</td>
									<td>{unescape(song.snippet.title)}</td>
									<td>{song.snippet.channelTitle}</td>
								</tr>
							))}
						</table>
					}
				</div>
			</div>
		);
	}
}

export default App;
