resource "random_string" "dev_password" {
  length  = 16
  special = false
}

locals {
  system      = var.system
  system_repo = var.registry_image
  branch_slug = replace(var.branch, "[^a-zA-Z0-9-]", "-")
  base_host   = coalesce(var.host, "${local.branch_slug}.${local.system}.${var.base_domain}")
  app_url     = "http${var.secure ? "s" : ""}://${local.base_host}"
  api_url     = "http${var.secure ? "s" : ""}://api.${local.base_host}"
}

resource "kubernetes_namespace" "branch" {
  metadata {
    name = coalesce(var.namespace, "review-${local.system}-${local.branch_slug}")
  }
}

# Get info by instance ID
data "scaleway_rdb_instance" "brezel" {
  instance_id = var.scw_rdb_instance_id
}

resource "scaleway_rdb_database" "system_meta" {
  instance_id = data.scaleway_rdb_instance.brezel.instance_id
  name        = "brezel_${local.system}_${var.branch}_meta"
}

resource "scaleway_rdb_database" "system" {
  instance_id = data.scaleway_rdb_instance.brezel.instance_id
  name        = "brezel_${local.system}_${var.branch}"
}

resource "random_password" "db_meta_password" {
  length = 32
}

resource "random_password" "db_password" {
  length = 32
}

resource "scaleway_rdb_user" "system_meta" {
  instance_id = data.scaleway_rdb_instance.brezel.instance_id
  name        = "brezel_${local.system}_${var.branch}_meta"
  password    = random_password.db_meta_password.result
}

resource "scaleway_rdb_privilege" "system_meta" {
  instance_id   = data.scaleway_rdb_instance.brezel.instance_id
  database_name = scaleway_rdb_database.system_meta.name
  user_name     = scaleway_rdb_user.system_meta.name
  permission    = "all"
}

resource "scaleway_rdb_user" "system" {
  instance_id = data.scaleway_rdb_instance.brezel.instance_id
  name        = "brezel_${local.system}_${var.branch}"
  password    = random_password.db_password.result
}

resource "scaleway_rdb_privilege" "system" {
  instance_id   = data.scaleway_rdb_instance.brezel.instance_id
  database_name = scaleway_rdb_database.system.name
  user_name     = scaleway_rdb_user.system.name
  permission    = "all"
}

module "system" {
  source            = "gitlab.kiwis-and-brownies.de/kibro/brezel-instance/kubernetes//brezel-instance"
  version           = "2.0.1"
  namespace         = kubernetes_namespace.branch.metadata[0].name
  cluster_issuer    = "letsencrypt"
  app_env           = var.app_env
  default_system    = local.system
  api_hostnames     = ["api.${local.base_host}"]
  hostnames         = [local.base_host]
  pma_hostname      = "pma.${local.base_host}"
  brotcast_hostname = "brotcast.${local.base_host}"
  export_hostname   = "export.staging.cluster-sw.brezel.io"
  image             = "${local.system_repo}:${local.branch_slug}"
  spa_image         = "${local.system_repo}:${local.branch_slug}-spa"
  brotcast_image    = "${local.system_repo}:${local.branch_slug}-brotcast"
  secure            = var.secure
  storage           = "10G"
  api_replicas      = 1
  with_export       = false
  cron_jobs         = false
  with_database_pod = false
  db_host           = data.scaleway_rdb_instance.brezel.endpoint_ip
  db_port           = data.scaleway_rdb_instance.brezel.endpoint_port
  db_name           = scaleway_rdb_database.system_meta.name
  db_user           = scaleway_rdb_user.system_meta.name
  db_password       = random_password.db_meta_password.result

  brezel_resources = {
    limits = {
      memory = "1.5Gi" # Intuitively, limit should be higher than requests, but all k8s guides say to make them equal.
    }
    requests = {
      cpu    = "1500m"
      memory = "1.5Gi" # A brezel instance ideling / handling some basic requests uses ~600mb, but to ensure stability, we set it to the same as our limit.
    }
  }

  env = {
    BREZEL_JOBS_SUPERVISOR_CONF           = "storage/workers.supervisord.conf"
    BREZEL_JOBS_SUPERVISOR_COMMAND        = "php bakery work --sleep=3 --tries=1"
    MAIL_DRIVER                           = "smtp"
    MAIL_HOST                             = var.mail_host
    MAIL_PORT                             = var.mail_port
    MAIL_USERNAME                         = var.mail_username
    MAIL_PASSWORD                         = var.mail_password
    MAIL_ENCRYPTION                       = var.mail_encryption
    MAIL_FROM_NAME                        = var.mail_from_name
    MAIL_FROM_ADDRESS                     = var.mail_from_address
    BREZEL_JOBS_SUPERVISOR_STDOUT_LOGFILE = "/app/storage/logs/worker.log"
    BROADCAST_DRIVER                      = "reverb"
    VAPID_PRIVATE_KEY                     = var.vapid_private_key
    VAPID_PUBLIC_KEY                      = var.vapid_public_key
    OPENAI_API_KEY                        = var.openai_api_key
  }

  system_envs = {
    "${local.system}" = {
      MANAGE_CONNECTION = "false"
      DB_DATABASE       = scaleway_rdb_database.system.name
      DB_USER           = scaleway_rdb_user.system.name
      DB_PASSWORD       = random_password.db_password.result
      ROOT_PASSWORD     = random_string.dev_password.result

      ROOT_PASSWORD = random_string.dev_password.result

      MAIL_DRIVER       = "smtp"
      MAIL_HOST         = var.mail_host
      MAIL_PORT         = var.mail_port
      MAIL_USERNAME     = var.mail_username
      MAIL_PASSWORD     = var.mail_password
      MAIL_ENCRYPTION   = var.mail_encryption
      MAIL_FROM_NAME    = var.mail_from_name
      MAIL_FROM_ADDRESS = var.mail_from_address
    }
  }
}

output "root_password" {
  value = random_string.dev_password.result
}
