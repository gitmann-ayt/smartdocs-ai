import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket where users will upload their documents
    const documentBucket = new s3.Bucket(this, 'DocumentsBucket', {
      bucketName: `smartdocs-uploads-${this.account}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.POST],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
    });

    // Lambda function that triggers on every upload
    const processDocumentFn = new nodejs.NodejsFunction(this, 'ProcessDocumentFn', {
      entry: path.join(__dirname, '../lambda/processDocument.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
      environment: {
        BUCKET_NAME: documentBucket.bucketName,
      },
    });

    // Grant Lambda permission to read from the bucket
    documentBucket.grantRead(processDocumentFn);

    // Trigger Lambda on every new file upload
    documentBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(processDocumentFn)
    );

    // Outputs
    new cdk.CfnOutput(this, 'DocumentsBucketName', {
      value: documentBucket.bucketName,
      description: 'S3 bucket for document uploads',
      exportName: 'SmartDocsUploadsBucket',
    });

    new cdk.CfnOutput(this, 'ProcessDocumentFnArn', {
      value: processDocumentFn.functionArn,
      description: 'Lambda function ARN',
    });
  }
}