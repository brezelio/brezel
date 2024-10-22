terraform {
  required_providers {
    kubernetes = {
      source = "hashicorp/kubernetes"
    }
    scaleway = {
      source = "scaleway/scaleway"
    }
  }
  backend "http" {
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}


# main.tf
variable "scw_access_key" {
  type = string
  sensitive = true
}

variable "scw_secret_key" {
  type = string
  sensitive = true
}

variable "scw_organization_id" {
  type = string
  sensitive = true
}

variable "scw_project_id" {
  type = string
  sensitive = true
}

provider "scaleway" {
  access_key      = var.scw_access_key
  secret_key      = var.scw_secret_key
  organization_id = var.scw_organization_id
  project_id      = var.scw_project_id
}
