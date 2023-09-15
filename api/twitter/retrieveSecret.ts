import {
	SecretsManagerClient,
	GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

type SecretValues = {
	TWITTER_API_SECRET: string,
	TWITTER_API_KEY: string,
	TWITTER_BEARER_TOKEN: string,
	TWITTER_ACCESS_TOKEN: string,
	TWITTER_ACCESS_TOKEN_SECRET: string,
}

const retrieveSecret = async (): Promise<SecretValues> => {

	const secret_name = "prod/twitter/api/key";

	const client = new SecretsManagerClient({
		region: "eu-west-1",
	});

	let response;

	try {
		response = await client.send(
			new GetSecretValueCommand({
				SecretId: secret_name,
			})
		);
	} catch (error) {
		throw error;
	}

	const secret: SecretValues = response.SecretString ? JSON.parse(response.SecretString) : {};
	return secret;
}

export default retrieveSecret;