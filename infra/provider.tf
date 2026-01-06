terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  backend "s3" {
    key    = "podcast-ai-saas/terraform.tfstate"
  }
}

provider "aws" {
    region = var.region
}
