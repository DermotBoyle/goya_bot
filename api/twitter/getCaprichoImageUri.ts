import { S3 } from 'aws-sdk'

export const getCaprichoImageUri = async () => {
	return {
		body: JSON.stringify(''),
		statusCode: 200,
		isBase64Encoded: false,
		headers: {
			'Content-Type': 'application/json',
		},
	}
}