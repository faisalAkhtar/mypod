import axios from "axios";
const KEY = process.env.REACT_APP_API_KEY_YOUTUBE;

export const baseTerms = {
	part: "snippet",
	maxResults: 10,
	key: KEY,
};

export default axios.create({
	baseURL: "https://www.googleapis.com/youtube/v3/",
});