variable "lambda_name" {
  type = string
}

variable "account_id" {
  default = 305870070165
}

variable "region" {
  type = string
}

variable "memory_size" {
  type    = number
  default = 256
}

variable "timeout" {
  type    = number
  default = 300
}


variable "image_tag_name" {
  type    = string
}

variable "policy_statements" {
  type = list(any)
  description = "List of IAM policy statements to attach to the Lambda role"
}

variable "environment_variables" {
  type    = map(string)
  default = {}
}
