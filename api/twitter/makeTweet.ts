import { getCaprichoImageUri } from "./getCaprichoImageUri";
import { getCredentials } from "./getCredentials";

export const makeTweet = async () => {
	// Get credentials
	const credentials = await getCredentials();
	// Get capricho
	const capricho = await getCaprichoImageUri();
	// Make tweet
	return {
		body: JSON.stringify(''),
		statusCode: 200,
		isBase64Encoded: false,
		headers: {
			'Content-Type': 'application/json',
		},
	};
}
