# ...

resource "aws_sfn_state_machine" "sfn_state_machine" {
  name     = var.step_function_name
  role_arn = aws_iam_role.step_function_role.arn

  definition = var.state_machine_definition
}


resource "aws_iam_role" "step_function_role" {
  name = "${var.step_function_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "states.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "step_function_policy" {
  name = "${var.step_function_name}-policy"
  role = aws_iam_role.step_function_role.id

  policy = var.policy_json
}