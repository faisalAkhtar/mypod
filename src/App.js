import React, { Component } from "react";
import './App.css';

import youtube, { baseTerms } from "./service/youtube";

class App extends Component {
	state = {
		inputTerm: "",
		videos: [],
		selectedVideo: null,
	}

	handleInputChange = (event) => {
		this.setState({
			inputTerm: event.target.value,
		});
	};

	handleCommandSubmit = async (event) => {
		event.preventDefault()

		let selectedVideo = { ...this.state.selectedVideo },
			videos = [...this.state.videos],
			inputTerm = this.state.inputTerm.toLowerCase()

		if (inputTerm !== "") {
			videos = await this.searchVideo(inputTerm)
			console.log(videos)
		}

		this.setState({
			inputTerm: "",
			videos,
			selectedVideo,
		});
	};

	searchVideo = async (inputTerm) => {
		const response = await youtube.get("/search", {
			params: {
				...baseTerms,
				q: inputTerm,
			},
		});
		return response.data.items;
	}

	render() {
		const {
			inputTerm,
			videos,
			// selectedVideo
		} = this.state;

		return (
			<div className="APP">
				<div className="FORM">
					<form onSubmit={this.handleCommandSubmit}>
						<input
							onChange={this.handleInputChange}
							name="command-input"
							type="text"
							placeholder="Insert your command here"
							value={inputTerm}
							autoFocus
						/>
					</form>
				</div>
				<div className="VIDEOS">
					{
						videos.length > 0 &&
						<div>
							<ul>
								{videos.map((video, index) => (
									<li id={video.id.videoId} key={video.id.videoId}>
										{index + 1}. {decodeURIComponent(video.snippet.title)}
									</li>
								))}
							</ul>
						</div>
					}
				</div>
			</div>
		);
	}
}

export default App;
