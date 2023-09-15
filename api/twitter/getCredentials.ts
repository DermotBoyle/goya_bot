import { TwitterApi } from 'twitter-api-v2'
import retrieveSecret from './retrieveSecret'

export const getCredentials = async (): Promise<TwitterApi> => {
	const secrets = await retrieveSecret()
	const userClient = new TwitterApi({ appKey: secrets.TWITTER_API_KEY, appSecret: secrets.TWITTER_API_SECRET, accessToken: secrets.TWITTER_ACCESS_TOKEN, accessSecret: secrets.TWITTER_ACCESS_TOKEN_SECRET })
	return userClient
}