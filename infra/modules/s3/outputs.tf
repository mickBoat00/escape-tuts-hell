output "bucket_id" {
  value = aws_s3_bucket.uploads.id
}

output "bucket_name" {
  value = aws_s3_bucket.uploads.bucket_domain_name
}

output "bucket_arn" {
  value = aws_s3_bucket.uploads.arn
}

output "bucket_regional_domain_name" {
  description = "The bucket region-specific domain name"
  value       = aws_s3_bucket.this.bucket_regional_domain_name
}

output "bucket_domain_name" {
  description = "The bucket domain name"
  value       = aws_s3_bucket.this.bucket_domain_name
}