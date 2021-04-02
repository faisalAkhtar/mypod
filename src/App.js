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
		songPauseTime: 0,
	}

	handleSongEvent = (c) => {
		this.setState({
			songEvent: c
		})
	}

	// handleSongCommands = async (event) => {
	// 	event.preventDefault()
	// }

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
			this.setState({
				songPauseTime: songEvent.target.getDuration()
			})
		}
	}

	pauseSong = () => {
		const { songEvent } = this.state;
		if (songEvent != null) {
			songEvent.target.pauseVideo()
			this.setState({
				songPauseTime: songEvent.target.getDuration()
			})
		}
	}

	resumeSong = () => {
		const { songEvent } = this.state;
		if (songEvent != null) {
			songEvent.target.playVideo()
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
		});
	}

	render() {
		const {
			inputTerm,
			songs,
			selectedSong
		} = this.state;

		const {
			// channelId,
			publishedAt,
			title,
			// description,
			thumbnails,
			channelTitle,
		} = selectedSong != null ? selectedSong.snippet : {};
		const imageURl = selectedSong != null ? thumbnails.medium.url : "";
		const publishedDate = selectedSong != null ? publishedAt.split("T")[0] : "";

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
				{
					selectedSong &&
					<div className="PLAYER">
						<div className="Player">
							<div className="Background"></div>
							<div className="Header">
								<div className="Title">Now Playing</div>
							</div>
							<div className="Artwork">
								<img src={imageURl} alt={title} />
							</div>
							<div className="TrackInformation">
								<div className="Name"></div>
								<div className="Artist">{title}</div>
							</div>
							<div className="Scrubber">
								<div className="Scrubber-Progress"></div>
							</div>
							<div className="Controls">
								<div className="Button">
									<i className="fa fa-fw fa-play"></i>
								</div>
							</div>
							<div className="Timestamps">
								<div className="Time Time--current">{publishedDate}</div>
								<div className="Time Time--total">{channelTitle}</div>
							</div>
							{selectedSong != null && (
								<SongEventHandler song={selectedSong} onSongEvent={(c) => this.handleSongEvent(c)} />
							)}
						</div>
					</div>
				}
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
