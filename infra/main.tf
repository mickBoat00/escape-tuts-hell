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

data "aws_ecr_image" "lambda_image" {
  repository_name = "main"
  image_tag       = var.image_tag
}

resource "aws_lambda_function_url" "example" {
  function_name      = module.backend_lambda.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = false
    allow_origins     = ["http://localhost:5174"]
    allow_methods     = ["*"]
    allow_headers     = ["*"]
    expose_headers    = ["*"]
    max_age           = 3000
  }
  
}

module "backend_lambda" {
  source = "./modules/lambda"

  lambda_name         = "esc-backend"
  region              = var.region
  account_id          = var.account_id
  image_url           = "${var.account_id}.dkr.ecr.${var.region}.amazonaws.com/main@${data.aws_ecr_image.lambda_image.image_digest}"
  timeout = 900

  environment_variables = {
    MONGODB_URI = var.mongodb_uri
    MONGODB_DB = var.mongodb_db
    MONGODB_COLLECTION = var.mongodb_collection
    S3_BUCKET_NAME=module.public_s3.bucket_name
    FRONTEND_URL="http://localhost:5174"
  }

  policy_statements = [
    {
      Effect = "Allow"
      Action = [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ]
      Resource = "*"
    },
    {
      Effect = "Allow"
      Action = [
        "s3:PutObject",
        "s3:GetObject",
        "s3:AbortMultipartUpload"
      ]
      Resource = "${module.public_s3.bucket_arn}/*"
    }
  ]
}

data "aws_ecr_image" "transcibe_image" {
  repository_name = "main"
  image_tag       = var.transcibe_image_tag
}

module "transcribe_lambda" {
  source = "./modules/lambda"

  lambda_name         = "esc-transcribe"
  region              = var.region
  account_id          = var.account_id
  image_url           = "${var.account_id}.dkr.ecr.${var.region}.amazonaws.com/main@${data.aws_ecr_image.transcibe_image.image_digest}"
  timeout = 900

  environment_variables = {
    MONGODB_URI = var.mongodb_uri
    MONGODB_DB = var.mongodb_db
    MONGODB_COLLECTION = var.mongodb_collection
    ASSEMBLYAI_API_KEY=var.assemblyai_api_key
  }

  policy_statements = [
    {
      Effect = "Allow"
      Action = [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ]
      Resource = "*"
    },
  ]
}
