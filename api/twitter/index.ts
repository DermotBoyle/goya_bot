import { getCaprichoImageUri } from "./getCaprichoImageUri";
import { getCredentials } from "./getCredentials";

const BUCKET_URL_CAPRICHOS = process.env.GOYA_CAPRICHOS_PUBLIC_BUCKET!;

export const handler = async () => {

	const userClient = await getCredentials();
	const capricho = await getCaprichoImageUri("capricho_one.jpg", BUCKET_URL_CAPRICHOS);

	const imageDownload = await fetch(capricho)
	const imageBuffer = Buffer.from(await imageDownload.arrayBuffer());

	const mediaId = await userClient.v1.uploadMedia(imageBuffer, {
		mimeType: "image/jpg",
	});

	await userClient.v2.tweet({
		text: "Our first post is LIVE!",
		media: {
			media_ids: [ mediaId ],
		}
	})
}