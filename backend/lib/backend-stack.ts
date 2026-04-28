import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

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

    // Output the bucket name so we can reference it later
    new cdk.CfnOutput(this, 'DocumentsBucketName', {
      value: documentBucket.bucketName,
      description: 'S3 bucket for document uploads',
      exportName: 'SmartDocsUploadsBucket',
    });
  }
}