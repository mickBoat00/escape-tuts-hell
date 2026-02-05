module "public_s3" {
  source      = "./modules/s3"
  bucket_name = "esc-tuts-two-${var.account_id}"

  enable_public_access = true
  public_read_policy   = true

  cors_rule = {
    allowed_methods = ["GET", "HEAD", "PUT", "DELETE"]
    allowed_origins = [
      "http://localhost:5174",
      "https://${module.frontend_cloudfront.cloudfront_domain_name}"
    ]
    allowed_headers = ["*"]
    expose_headers  = []
    max_age_seconds = 3000
  }
}

module "frontend_s3" {
  source      = "./modules/s3"
  bucket_name = "esc-tuts-frontend-${var.account_id}"

  enable_public_access = false
  public_read_policy   = false
  enable_versioning    = false

}

module "frontend_cloudfront" {
  source = "./modules/cloudfront"

  bucket_id                   = module.frontend_s3.bucket_id
  bucket_regional_domain_name = module.frontend_s3.bucket_regional_domain_name
  bucket_arn                  = module.frontend_s3.bucket_arn

  distribution_name = "Escape Tutorials Frontend"
  price_class       = "PriceClass_100"
  environment       = "production"
}

resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket      = module.public_s3.bucket_id
  eventbridge = true
}

resource "aws_lambda_function_url" "backend" {
  function_name      = module.backend_lambda.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = false
    allow_origins     = [
      "http://localhost:5174",
      "https://${module.frontend_cloudfront.cloudfront_domain_name}"
    ]
    allow_methods     = ["*"]
    allow_headers     = ["*"]
    expose_headers    = ["*"]
    max_age           = 3000
  }
  depends_on = [ module.backend_lambda ]
}

module "backend_lambda" {
  source = "./modules/lambda"

  lambda_name         = "esc-backend"
  region              = var.region
  account_id          = var.account_id
  image_tag_name      = var.backend_image_tag
  timeout = 900

  environment_variables = {
    MONGODB_URI = var.mongodb_uri
    MONGODB_DB = var.mongodb_db
    MONGODB_COLLECTION = var.mongodb_collection
    S3_BUCKET_NAME=module.public_s3.bucket_id
    FRONTEND_URL="http://localhost:5174"
    STEP_FUNCTION_ARN=module.step_function.state_machine_arn
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
    },
    {
      Effect = "Allow"
      Action = [
        "states:StartExecution"
      ]
      Resource = module.step_function.state_machine_arn
    }
  ]
}

module "transcribe_lambda" {
  source = "./modules/lambda"

  lambda_name         = "esc-transcribe"
  region              = var.region
  account_id          = var.account_id
  image_tag_name      = var.transcibe_image_tag
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

module "status_lambda" {
  source = "./modules/lambda"

  lambda_name         = "esc-statuses"
  region              = var.region
  account_id          = var.account_id
  image_tag_name      = var.status_image_tag
  timeout = 900

  environment_variables = {
    MONGODB_URI = var.mongodb_uri
    MONGODB_DB = var.mongodb_db
    MONGODB_COLLECTION = var.mongodb_collection
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

module "llm_lambda" {
  source = "./modules/lambda"

  lambda_name         = "llm-content-generator"
  region              = var.region
  account_id          = var.account_id
  image_tag_name      = var.llm_image_tag
  timeout = 900

  environment_variables = {
    MONGODB_URI = var.mongodb_uri
    MONGODB_DB = var.mongodb_db
    MONGODB_COLLECTION = var.mongodb_collection
    CONTENT_TYPE = "CodingTutorialChecker"
    GEMINI_API_KEY = var.gemini_api_key
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

module "step_function" {
  source = "./modules/step_function"
  step_function_name = "Esc-tutorials-Workflow"
  policy_json = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = [
          module.transcribe_lambda.lambda_arn,
          "${module.transcribe_lambda.lambda_arn}:*",

          module.status_lambda.lambda_arn,
          "${module.status_lambda.lambda_arn}:*",

          module.llm_lambda.lambda_arn,
          "${module.llm_lambda.lambda_arn}:*",
        ]
      }
    ]
  })
  state_machine_definition = jsonencode({
  Comment       = "Escape Tutorials workflow (with early retry branching)"
  QueryLanguage = "JSONata"
  StartAt       = "StatusUpdater"

  States = {

    StatusUpdater = {
      Type     = "Task"
      Resource = "arn:aws:states:::lambda:invoke"
      Output   = "{% $states.result.Payload %}"
      Arguments = {
        FunctionName = module.status_lambda.lambda_arn
        Payload      = "{% $states.input %}"
      }
      Retry = [
        {
          ErrorEquals = [
            "Lambda.ServiceException",
            "Lambda.AWSLambdaException",
            "Lambda.SdkClientException",
            "Lambda.TooManyRequestsException"
          ]
          IntervalSeconds = 1
          MaxAttempts     = 3
          BackoffRate     = 2
          JitterStrategy  = "FULL"
        }
      ]
      Next = "IsRetryExecution"
    }

    IsRetryExecution = {
      Type = "Choice"
      Choices = [
        {
          Condition = "{% $states.input.isRetry = true %}"
          Next      = "RetryDispatcher"
        }
      ]
      Default = "Transcribe"
    }

    RetryDispatcher = {
      Type = "Pass"
      Next = "ParallelContentGeneration"
    }

    Transcribe = {
      Type     = "Task"
      Resource = "arn:aws:states:::lambda:invoke"
      Output   = "{% $states.result.Payload %}"
      Arguments = {
        FunctionName = module.transcribe_lambda.lambda_arn
        Payload      = "{% $states.input %}"
      }
      Retry = [
        {
          ErrorEquals = [
            "Lambda.ServiceException",
            "Lambda.AWSLambdaException",
            "Lambda.SdkClientException",
            "Lambda.TooManyRequestsException"
          ]
          IntervalSeconds = 1
          MaxAttempts     = 3
          BackoffRate     = 2
          JitterStrategy  = "FULL"
        }
      ]
      Next = "CodingTutorialChecker"
    }

    CodingTutorialChecker = {
      Type     = "Task"
      Resource = "arn:aws:states:::lambda:invoke"
      Output   = "{% $states.result.Payload %}"
      Arguments = {
        FunctionName = module.llm_lambda.lambda_arn
        Payload      = "{% $merge([$states.input, { 'contentType': 'CodingTutorialChecker', 'jobName': 'CodingTutorialChecker' }]) %}"
      }
      Retry = [
        {
          ErrorEquals = [
            "Lambda.ServiceException",
            "Lambda.AWSLambdaException",
            "Lambda.SdkClientException",
            "Lambda.TooManyRequestsException"
          ]
          IntervalSeconds = 1
          MaxAttempts     = 3
          BackoffRate     = 2
          JitterStrategy  = "FULL"
        }
      ]
      Next = "IsCodingTutorial"
    }

    IsCodingTutorial = {
      Type = "Choice"
      Choices = [
        {
          Condition = "{% $boolean($states.input.isCodingTutorial) %}"
          Next      = "ParallelContentGeneration"
        }
      ]
      Default = "MarkAsCompleted"
    }

    ParallelContentGeneration = {
      Type = "Parallel"

      Branches = [

        {
          StartAt = "TutorialQnA"
          States = {
            TutorialQnA = {
              Type     = "Task"
              Resource = "arn:aws:states:::lambda:invoke"
              Output   = "{% $states.result.Payload %}"
              Arguments = {
                FunctionName = module.llm_lambda.lambda_arn
                Payload      = "{% $merge([$states.input, { 'contentType': 'TutorialQA', 'jobName': 'TutorialQA' }]) %}"
              }
              Retry = [
                {
                  ErrorEquals = [
                    "Lambda.ServiceException",
                    "Lambda.AWSLambdaException",
                    "Lambda.SdkClientException",
                    "Lambda.TooManyRequestsException"
                  ]
                  IntervalSeconds = 1
                  MaxAttempts     = 3
                  BackoffRate     = 2
                  JitterStrategy  = "FULL"
                }
              ]
              End = true
            }
          }
        },

        {
          StartAt = "CodingChallenge"
          States = {
            CodingChallenge = {
              Type     = "Task"
              Resource = "arn:aws:states:::lambda:invoke"
              Output   = "{% $states.result.Payload %}"
              Arguments = {
                FunctionName = module.llm_lambda.lambda_arn
                Payload      = "{% $merge([$states.input, { 'contentType': 'CodingChallenge', 'jobName': 'CodingChallenge' }]) %}"
              }
              Retry = [
                {
                  ErrorEquals = [
                    "Lambda.ServiceException",
                    "Lambda.AWSLambdaException",
                    "Lambda.SdkClientException",
                    "Lambda.TooManyRequestsException"
                  ]
                  IntervalSeconds = 1
                  MaxAttempts     = 3
                  BackoffRate     = 2
                  JitterStrategy  = "FULL"
                }
              ]
              End = true
            }
          }
        },

        {
          StartAt = "Summary"
          States = {
            Summary = {
              Type     = "Task"
              Resource = "arn:aws:states:::lambda:invoke"
              Output   = "{% $states.result.Payload %}"
              Arguments = {
                FunctionName = module.llm_lambda.lambda_arn
                Payload      = "{% $merge([$states.input, { 'contentType': 'SimulateRetry', 'jobName': 'SimulateRetry' }]) %}"
              }
              Retry = [
                {
                  ErrorEquals = [
                    "Lambda.ServiceException",
                    "Lambda.AWSLambdaException",
                    "Lambda.SdkClientException",
                    "Lambda.TooManyRequestsException"
                  ]
                  IntervalSeconds = 1
                  MaxAttempts     = 3
                  BackoffRate     = 2
                  JitterStrategy  = "FULL"
                }
              ]
              End = true
            }
          }
        }

      ]

      Output = "{% $merge($states.input) %}"
      Next   = "MarkAsCompleted"
    }

    MarkAsCompleted = {
      Type     = "Task"
      Resource = "arn:aws:states:::lambda:invoke"
      Output   = "{% $states.result.Payload %}"
      Arguments = {
        FunctionName = module.status_lambda.lambda_arn
        Payload      = "{% $merge([$states.input, { 'status': 'completed' }]) %}"
      }
      Retry = [
        {
          ErrorEquals = [
            "Lambda.ServiceException",
            "Lambda.AWSLambdaException",
            "Lambda.SdkClientException",
            "Lambda.TooManyRequestsException"
          ]
          IntervalSeconds = 1
          MaxAttempts     = 3
          BackoffRate     = 2
          JitterStrategy  = "FULL"
        }
      ]
      Next = "EndWorkflow"
    }

    EndWorkflow = {
      Type = "Succeed"
    }
  }
})
}

# event bridge configuration

resource "aws_cloudwatch_event_rule" "s3_object_created" {
  name = "esc-s3-uploaded"

  event_pattern = jsonencode({
    source      = ["aws.s3"]
    detail-type = ["Object Created"]
    detail = {
      bucket = {
        name = [module.public_s3.bucket_id]
      }
      object = {
        key = [{
          prefix = "uploads/"
        }]
      }
    }
  })
}


resource "aws_iam_role" "eventbridge_stepfn_role" {
  name = "eventbridge-stepfn-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "events.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "eventbridge_stepfn_policy" {
  role = aws_iam_role.eventbridge_stepfn_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = "states:StartExecution"
      Resource = module.step_function.state_machine_arn
    }]
  })
}


resource "aws_cloudwatch_event_target" "start_workflow" {
  rule     = aws_cloudwatch_event_rule.s3_object_created.name
  arn      = module.step_function.state_machine_arn
  role_arn = aws_iam_role.eventbridge_stepfn_role.arn
}
