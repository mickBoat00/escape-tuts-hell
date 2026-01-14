output "bucket_id" {
  value = aws_s3_bucket.uploads.id
}

output "bucket_name" {
  value = aws_s3_bucket.uploads.bucket_domain_name
}

output "bucket_arn" {
  value = aws_s3_bucket.uploads.arn
}
