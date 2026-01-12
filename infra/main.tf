module "public_s3" {
  source      = "./modules/s3"
  bucket_name = "esc-tuts-${var.account_id}"

  cors_rule = {
    allowed_methods = ["GET", "HEAD", "PUT", "DELETE"]
    allowed_origins = [
      "http://localhost:5174"
    ]
    allowed_headers = ["*"]
    expose_headers  = []
    max_age_seconds = 3000
  }
  
}