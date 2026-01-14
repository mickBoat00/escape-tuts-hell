data "aws_ecr_image" "ecr" {
  repository_name = "main"
  image_tag       = var.image_tag_name
}


resource "aws_lambda_function" "lambda_function" {
  function_name = var.lambda_name
  role          = aws_iam_role.lambda_exec_role.arn

  package_type = "Image"
  
  image_uri    = "${var.account_id}.dkr.ecr.${var.region}.amazonaws.com/main@${data.aws_ecr_image.ecr.image_digest}"
  memory_size = var.memory_size
  timeout     = var.timeout

  environment {
    variables = var.environment_variables
  }
}

resource "aws_iam_role" "lambda_exec_role" {
  name = "${var.lambda_name}-exec-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "lambda_policy" {
  name = "${var.lambda_name}-policy"
  role = aws_iam_role.lambda_exec_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = var.policy_statements
  })
}