export const getCaprichoImageUri = async (fileName: string, baseUrlOfBucket: string) => {
	return baseUrlOfBucket + fileName;
}