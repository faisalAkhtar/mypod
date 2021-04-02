import React, { Component } from "react";

class SongEventHandler extends Component {
    componentDidMount = () => {
        if (!window.YT) {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";

            window.onYouTubeIframeAPIReady = this.loadVideo;

            const firstScriptTag = document.getElementsByTagName("script")[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
            this.loadVideo();
        }
    };

    loadVideo = () => {
        const { song } = this.props;
        const id = song.id.videoId;

        this.player = new window.YT.Player(`youtube-player`, {
            videoId: id,
            events: {
                onReady: this.onPlayerReady,
            },
        });
    };

    onPlayerStateChange = (event) => { };

    onPlayerReady = (event) => {
        event.target.playVideo();
        this.props.onSongEvent(event);
    };

    render() {
        const { song } = this.props;

        if (!song) {
            return <div>Loading ...</div>;
        }

        return (
            <div>
                <div style={{ display: "none" }}>
                    <div id={`youtube-player`}></div>
                </div>
            </div>
        );
    }
}

export default SongEventHandler;