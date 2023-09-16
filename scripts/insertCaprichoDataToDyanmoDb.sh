#!/bin/bash

# Specify the JSON file containing the data
JSON_FILE="$1"

# Specify the DynamoDB table name
DYNAMODB_TABLE="$2"

# Run AWS CLI command to upload data
aws dynamodb batch-write-item --request-items file://$JSON_FILE

# Check the exit status of the AWS CLI command
if [ $? -eq 0 ]; then
  echo "Data uploaded successfully to DynamoDB table $DYNAMODB_TABLE."
else
  echo "Error uploading data to DynamoDB table $DYNAMODB_TABLE."
fi
