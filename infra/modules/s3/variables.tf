variable "bucket_name" {
  
}


variable "cors_rule" {
  description = "Single CORS rule for the S3 bucket"
  type = object({
    allowed_methods = list(string)
    allowed_origins = list(string)
    allowed_headers = list(string)
    expose_headers  = list(string)
    max_age_seconds = number
  })
  default = null
}