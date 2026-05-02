#!/usr/bin/env bash
# Run in AWS CloudShell (region Frankfurt): upload this file or paste, then: bash setup-s3-eu-central-1.sh

set -euo pipefail

REGION="eu-central-1"
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
BUCKET="linex-uploads-${ACCOUNT_ID}-eu-central-1"
ROLE_NAME="linex-ec2-s3-uploads"
INSTANCE_PROFILE="linex-ec2-s3-profile"

echo "Account=${ACCOUNT_ID} Region=${REGION} Bucket=${BUCKET}"

if aws s3api head-bucket --bucket "${BUCKET}" 2>/dev/null; then
  echo "Bucket exists: ${BUCKET}"
else
  aws s3 mb "s3://${BUCKET}" --region "${REGION}"
fi

# Public read for object URLs (matches storage.ts default URL pattern)
aws s3api put-public-access-block \
  --bucket "${BUCKET}" \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

aws s3api put-bucket-policy --bucket "${BUCKET}" --policy "$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadObjects",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::${BUCKET}/*"
  }]
}
EOF
)"

INLINE_TRUST='{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "ec2.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}'

aws iam create-role --role-name "${ROLE_NAME}" --assume-role-policy-document "${INLINE_TRUST}" 2>/dev/null || true

aws iam put-role-policy --role-name "${ROLE_NAME}" --policy-name "LinexS3UploadsInline" --policy-document "$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:ListBucket"],
    "Resource": ["arn:aws:s3:::${BUCKET}", "arn:aws:s3:::${BUCKET}/*"]
  }]
}
EOF
)"

aws iam create-instance-profile --instance-profile-name "${INSTANCE_PROFILE}" 2>/dev/null || true
aws iam add-role-to-instance-profile --instance-profile-name "${INSTANCE_PROFILE}" --role-name "${ROLE_NAME}" 2>/dev/null || true

echo ""
echo "=== Done ==="
echo "S3 bucket:           ${BUCKET}"
echo "IAM role:            ${ROLE_NAME}"
echo "Instance profile:    ${INSTANCE_PROFILE}"
echo ""
echo "Console: EC2 → rasi-app → Actions → Security → Modify IAM role"
echo "  Attach: ${ROLE_NAME}"
echo ""
echo "SSH to EC2; in ~/linex/.env set:"
echo "  AWS_REGION=\"${REGION}\""
echo "  AWS_S3_BUCKET=\"${BUCKET}\""
echo "Then: cd ~/linex && pm2 restart linex --update-env"
