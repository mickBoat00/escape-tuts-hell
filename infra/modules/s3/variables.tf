variable "bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
}

variable "cors_rule" {
  description = "CORS configuration for the bucket"
  type = object({
    allowed_methods = list(string)
    allowed_origins = list(string)
    allowed_headers = list(string)
    expose_headers  = list(string)
    max_age_seconds = number
  })
  default = null
}

variable "enable_versioning" {
  description = "Enable versioning for the bucket"
  type        = bool
  default     = false
}

variable "enable_public_access" {
  description = "Enable public access to the bucket (for AssemblyAI, etc.)"
  type        = bool
  default     = false
}

variable "public_read_policy" {
  description = "Enable public read policy for all objects"
  type        = bool
  default     = false
}