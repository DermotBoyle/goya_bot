import * as cdk from 'aws-cdk-lib';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
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
      blockPublicAccess: new cdk.aws_s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      objectOwnership: cdk.aws_s3.ObjectOwnership.OBJECT_WRITER,
    });

    const goyaCaprichosPublicBucketPolicy = new PolicyStatement({
      effect: cdk.aws_iam.Effect.ALLOW,
      actions: [ 's3:GetObject', 's3:PutObject' ],
      resources: [ `${goyaCaprichosPublicBucket.bucketArn}/*`, `${goyaCaprichosPublicBucket.bucketArn}` ],
    });

    const goyaCaprichosSecretManagerAccessPolicy = new PolicyStatement({
      effect: cdk.aws_iam.Effect.ALLOW,
      actions: [ 'secretsmanager:GetSecretValue' ],
      resources: [ `*` ]
    });

    new cdk.aws_s3_deployment.BucketDeployment(this, 'goyaCaprichosPublicBucketDeployment', {
      sources: [ cdk.aws_s3_deployment.Source.asset(path.join(__dirname, '..', 'assets')) ],
      destinationBucket: goyaCaprichosPublicBucket,
    });

    const caprichosDynamoTable = new cdk.aws_dynamodb.Table(this, 'LosCaprichos', {
      partitionKey: {
        name: 'plate_number',
        type: cdk.aws_dynamodb.AttributeType.STRING
      },
      billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    const makeTweetFunc = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'makeTweet', {
      functionName: 'makeTweet',
      entry: path.join(__dirname, '..', 'api', 'twitter', 'index.ts'),
      handler: 'handler',
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      environment: {
        'GOYA_CAPRICHOS_PUBLIC_BUCKET': goyaCaprichosPublicBucket.bucketName,
        'GOYA_CAPRICHOS_DYNAMO_TABLE_NAME': caprichosDynamoTable.tableName
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    new Rule(this, 'makeTweetRule', {
      schedule: Schedule.cron({
        minute: '0',
        hour: '6',
      }),
      targets: [ new targets.LambdaFunction(makeTweetFunc) ],
    });


    caprichosDynamoTable.grantReadWriteData(makeTweetFunc);
    makeTweetFunc.addToRolePolicy(goyaCaprichosPublicBucketPolicy);
    makeTweetFunc.addToRolePolicy(goyaCaprichosSecretManagerAccessPolicy);
  }
}
