const baseS3url = '.s3.amazonaws.com/'

type getCaprichoImageUriProps = {
	filename: string,
	bucketName: string
}

export const getCaprichoImageUri = async ({ filename, bucketName }: getCaprichoImageUriProps) => {
	return `https://${bucketName}` + baseS3url + `${filename}`;
}