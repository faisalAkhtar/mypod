import React, { Component } from "react";
import './App.css';

import youtube, { baseTerms } from "./service/youtube";

class App extends Component {
	state = {
		inputTerm: "",
		songs: [],
		selectedSong: null,
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

	render() {
		const {
			inputTerm,
			songs,
			// selectedSong
		} = this.state;

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
								<tr key={song.id.songId}>
									<td key={song.id.songId + 'in'}>{index + 1}</td>
									<td key={song.id.songId + 'ti'}>{unescape(song.snippet.title)}</td>
									<td key={song.id.songId + 'ch'}>{song.snippet.channelTitle}</td>
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
