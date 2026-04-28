import { S3Event } from 'aws-lambda';

export const handler = async (event: S3Event): Promise<void> => {
  for (const record of event.Records) {
    const bucketName = record.s3.bucket.name;
    const objectKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    const fileSize = record.s3.object.size;

    console.log('=== New Document Uploaded ===');
    console.log(`Bucket: ${bucketName}`);
    console.log(`File: ${objectKey}`);
    console.log(`Size: ${fileSize} bytes`);
    console.log('Processing will begin shortly...');
  }
};