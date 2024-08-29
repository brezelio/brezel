source .env

BRANCH_STATE=$(git rev-parse --abbrev-ref HEAD | tr / -)
export TF_VAR_branch=$BRANCH_STATE

terraform init \
    -backend-config="address=https://gitlab.kiwis-and-brownies.de/api/v4/projects/53/terraform/state/scaleway-$BRANCH_STATE" \
    -backend-config="lock_address=https://gitlab.kiwis-and-brownies.de/api/v4/projects/53/terraform/state/scaleway-$BRANCH_STATE/lock" \
    -backend-config="unlock_address=https://gitlab.kiwis-and-brownies.de/api/v4/projects/53/terraform/state/scaleway-$BRANCH_STATE/lock" \
    -backend-config="username=$GITLAB_USERNAME" \
    -backend-config="password=$GITLAB_ACCESS_TOKEN" \
    -backend-config="lock_method=POST" \
    -backend-config="unlock_method=DELETE" \
    -backend-config="retry_wait_min=5" \
    -migrate-state \
    -upgrade
