resource "aws_s3_bucket" "uploads" {
  bucket = var.bucket_name
}


resource "aws_s3_bucket_public_access_block" "this" {
  bucket                  = aws_s3_bucket.uploads.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_cors_configuration" "this" {
  count  = var.cors_rule == null ? 0 : 1
  bucket = aws_s3_bucket.uploads.id

  cors_rule {
    allowed_methods = var.cors_rule.allowed_methods
    allowed_origins = var.cors_rule.allowed_origins
    allowed_headers = var.cors_rule.allowed_headers
    expose_headers  = var.cors_rule.expose_headers
    max_age_seconds = var.cors_rule.max_age_seconds
  }
}

