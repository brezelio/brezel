variable "branch" {
  type = string
}

variable "app_env" {
  description = "App Env (one of local, staging, production)"
  type = string
  default = "staging"
}

variable "secure" {
  description = "Whether to issue certificates for HTTPS"
  type = bool
  default = true
}

variable "mail_from_address" {
  default = ""
}

variable "mail_from_name" {
  default = ""
}

variable "mail_password" {
  default = ""
}

variable "mail_username" {
  default = ""
}

variable "mail_port" {
  default = 2525
}

variable "mail_host" {
  default = "smtp.mailtrap.io"
}

variable "mail_encryption" {
  default = "tls"
}

variable "vapid_private_key" {
  default = ""
}

variable "vapid_public_key" {
  default = ""
}

variable "openai_api_key" {
  default = ""
}

variable "scw_rdb_instance_id" {
  type = string
}
