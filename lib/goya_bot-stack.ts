import * as cdk from 'aws-cdk-lib';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';

export class GoyaBotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const goyaCaprichosPublicBucket = new cdk.aws_s3.Bucket(this, 'goyaCaprichosPublicBucket', {
      bucketName: 'goya-caprichos-public-bucket',
      publicReadAccess: true,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      encryption: cdk.aws_s3.BucketEncryption.S3_MANAGED,
    });

    // Get object policy for bucket
    const goyaCaprichosPublicBucketPolicy = new PolicyStatement({
      effect: cdk.aws_iam.Effect.ALLOW,
      actions: [ 's3:GetObject' ],
      resources: [ `${goyaCaprichosPublicBucket.bucketArn}/*`, `${goyaCaprichosPublicBucket.bucketArn}/*` ],
    });

    // Create new bucket deployment
    new cdk.aws_s3_deployment.BucketDeployment(this, 'goyaCaprichosPublicBucketDeployment', {
      sources: [ cdk.aws_s3_deployment.Source.asset(path.join(__dirname, '..', 'assets')) ],
      destinationBucket: goyaCaprichosPublicBucket,
    });

    const makeTweetFunc = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'makeTweet', {
      functionName: 'makeTweet',
      entry: path.join(__dirname, '..', 'api', 'makeTweet.ts'),
      handler: 'handler',
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      environment: {
        'GOYA_CAPRICHOS_PUBLIC_BUCKET': goyaCaprichosPublicBucket.bucketName,
      },
    });

    makeTweetFunc.addToRolePolicy(goyaCaprichosPublicBucketPolicy);

  }
}
