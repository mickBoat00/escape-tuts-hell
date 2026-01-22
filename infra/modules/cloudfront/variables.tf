variable "bucket_id" {
  description = "S3 bucket ID for the origin"
  type        = string
}

variable "bucket_regional_domain_name" {
  description = "Regional domain name of the S3 bucket"
  type        = string
}

variable "bucket_arn" {
  description = "ARN of the S3 bucket"
  type        = string
}

variable "distribution_name" {
  description = "Name tag for the CloudFront distribution"
  type        = string
  default     = "Escape Tutorials Frontend"
}

variable "price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}