terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  backend "s3" {
    key    = "tutorials_upload/terraform.tfstate"
  }
}

provider "aws" {
    region = var.region
}
