module "public_s3" {
  source      = "./modules/s3"
  bucket_name = "tutorials-storage-${var.account_id}"
  cors_allowed_methods = ["GET", "PUT", "POST", "HEAD"]
  cors_allowed_origins = [
      "http://localhost:5174",
    ]
}
