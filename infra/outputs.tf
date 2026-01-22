# Backend API URL
output "api_base_url" {
  description = "Backend Lambda function URL"
  value       = module.backend_lambda.lambda_function_url
}

# Frontend S3 Bucket
output "frontend_bucket_name" {
  description = "Frontend S3 bucket name"
  value       = module.frontend_s3.bucket_id
}

# CloudFront Distribution
output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID for cache invalidation"
  value       = module.frontend_cloudfront.cloudfront_distribution_id
}

output "cloudfront_url" {
  description = "CloudFront URL for the frontend application"
  value       = module.frontend_cloudfront.cloudfront_url
}

output "frontend_url" {
  description = "Public URL to access the frontend"
  value       = module.frontend_cloudfront.cloudfront_url
}

# Environment variables for frontend build
output "frontend_env_vars" {
  description = "Environment variables to use when building the frontend"
  value = {
    VITE_API_URL = module.backend_lambda.lambda_function_url
  }
}