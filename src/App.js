import React, { Component } from "react";
import './App.css';

import VideoEventHandler from "./component/VideoEventHandler"

import youtube, { baseTerms } from "./service/youtube";

class App extends Component {
	state = {
		inputTerm: "",
		songs: [],
		selectedSong: null,
		videoEvent: null,
		videoPauseTime: 0,
	}

	handleVideoEvent = (c) => {
		this.setState({
			videoEvent: c
		})
	}

	handleVideoCommands = async (event) => {
		event.preventDefault()
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
			console.log(songs)
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
		const { videoEvent } = this.state;
		if (videoEvent != null) {
			videoEvent.target.setVolume(volume)
			this.setState({
				videoPauseTime: videoEvent.target.getDuration()
			})
		}
	}

	pauseVideo = () => {
		const { videoEvent } = this.state;
		if (videoEvent != null) {
			videoEvent.target.pauseVideo()
			this.setState({
				videoPauseTime: videoEvent.target.getDuration()
			})
		}
	}

	resumeVideo = () => {
		const { videoEvent } = this.state;
		if (videoEvent != null) {
			videoEvent.target.stopVideo()
			return true
		}
		return false
	}

	stopVideo() {
		const { videoEvent } = this.state
		if (videoEvent != null) {
			videoEvent.target.stopVideo()
			return true
		}
		return false
	}

	playVideo = (index) => {
		console.log(index)

		let selectedSong = { ...this.state.selectedSong };
		let songs = [...this.state.songs];
		const videoEvent = this.state.videoEvent;

		selectedSong = { ...songs[index] }
		if (videoEvent != null) {
			videoEvent.target.loadVideoById(selectedSong.id.videoId)
		}

		this.setState({
			selectedSong,
			songs,
		});

		let _ = this
		setTimeout(function () {
			console.log("{ ...this.state.selectedSong }")
			console.log({ ..._.state.selectedSong })
			console.log("this.state.videoEvent")
			console.log(_.state.videoEvent)
		}, 3000);
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
							<VideoEventHandler video={selectedSong} onVideoEvent={(c) => this.handleVideoEvent(c)} />
						)}
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
								<tr key={song.id.songId} onClick={this.playVideo.bind(this, index)}>
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
