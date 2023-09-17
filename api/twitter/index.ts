import { getCaprichoImageUri } from "./getCaprichoImageUri";
import { getCredentials } from "./getCredentials";
import { DynamoDB } from 'aws-sdk'

const BUCKET_NAME = process.env.GOYA_CAPRICHOS_PUBLIC_BUCKET!;
const TABLE_NAME = process.env.GOYA_CAPRICHOS_DYNAMO_TABLE_NAME!;

interface Capricho {
	filename: string;
	plate_number: string;
	name: string;
	translation: string;
	description: string;
	hasBeenTweeted: boolean;
}

const dynamoClient = new DynamoDB.DocumentClient({
	region: "us-east-1",
});

export const handler = async () => {
	const scanResults: Capricho[] = [];
	const userClient = await getCredentials();


	try {
		const allNonTweetedItems = await dynamoClient.scan({
			TableName: TABLE_NAME,
			Limit: 80, // Max of our table for this project
		}).promise();

		allNonTweetedItems.Items?.forEach(async (item) => scanResults.push(item as Capricho));

		const sortedResult = scanResults?.filter((item) => !item.hasBeenTweeted).sort((a, b) => parseInt(a.plate_number) - parseInt(b.plate_number));

		const capricho = await getCaprichoImageUri({ filename: sortedResult[ 0 ].filename + '.jpg', bucketName: BUCKET_NAME });
		const imageDownload = await fetch(capricho)
		const imageBuffer = Buffer.from(await imageDownload.arrayBuffer());

		const mediaId = await userClient.v1.uploadMedia(imageBuffer, {
			mimeType: "image/jpg",
		});

		const textForTweet = `${sortedResult[ 0 ].name}.\n${sortedResult[ 0 ].translation}.`;
		const textForTweetContext = sortedResult[ 0 ].description;

		const res = await userClient.v2.tweet({
			text: textForTweet,
			media: {
				media_ids: [ mediaId ],
			}
		})

		const resContextTweet = await userClient.v2.tweet({
			text: textForTweetContext,
			reply: {
				in_reply_to_tweet_id: res.data.id,
			}
		});

		if (res.errors || resContextTweet.errors) {
			console.log(res.errors, "ERRORS")
			return; //return early if there are errors
		}

		const updatedItemInTable = await dynamoClient.update({
			TableName: TABLE_NAME,
			Key: {
				plate_number: sortedResult[ 0 ].plate_number,
			},
			UpdateExpression: "set hasBeenTweeted = :r",
			ExpressionAttributeValues: {
				":r": true,
			},
			ReturnValues: "UPDATED_NEW",
		}).promise();

		console.log(updatedItemInTable, "UPDATED ITEM IN TABLE")

	} catch (error) {
		console.log(error, "ERROR")
	}
}