---
name: brezel-api-client
description: Safely inspect and operate an external Brezel instance over its REST API with an API key, including modules, resources, filters, relations, nested lists, files, and workflow webhooks. Use only for other Brezel instances, never for this system's own records.
---
<!-- Based on kibro/openclaw-skills/skills/brezel-api-client/SKILL.md (commit 66164ba). Modified by Kiwis & Brownies for Brezel agents, 2026-11: limited to external instances, credentials from Brezel secrets and the shell sandbox, scripts as files of the skill, removed product-specific skill references. -->

# Brezel API Client

Use this skill for generic Brezel transport and persistence behavior. Product-specific fields and lifecycle invariants belong to the product's own documentation or skill.

Compatibility audited: Brezel API 3.43.0 production behavior and a linked 3.47.1 source checkout, 2026-07-28.

## When To Use

Only for an **external** Brezel instance: another company's or another system's Brezel, reached over its REST API with an API key. Never for the Brezel system you work in; for its records, files and workflows use your own tools (entities, files, workflows), which respect this system's permissions.

## Credentials

Each external instance is one secret of type API key in Brezel: its value is the API key, its URL the API address of the instance with the system, for example `https://acme-api.brezel.cloud/acme`. Never ask for the key in the chat and never write it into a command, a file or your reply.

1. Find the secret with `search_available_secrets` (query: the instance or company name). Its `url` is not secret: `BREZEL_BASE_URL` is everything before the last path segment (`https://acme-api.brezel.cloud`), `BREZEL_TENANT` the last segment (`acme`). If there is no such secret, ask the person to store the API key as a secret with the instance's API address as its URL.
2. Request access with `request_secret_access`.
3. Run every call with `shell_execute`, `network_access: true`, and bind the key as an environment variable: `secret_bindings_json` `[{"module_identifier": "<secret module>", "secret_entity_id": <id>, "secret_access_handle": "<handle>", "env": "BREZEL_API_KEY"}]`. Set the other two in the command: `BREZEL_BASE_URL=... BREZEL_TENANT=... python3 brezel_call.py ...`.

Without the shell (an execution profile with network access) you cannot reach an external instance; tell the person that this agent needs it.

Prefer `X-API-Key`. Bearer authentication can also exist.

## Core Endpoints

```text
GET    /{tenant}/modules
GET    /{tenant}/modules/{module}
GET    /{tenant}/modules/{module}/resources
POST   /{tenant}/modules/{module}/resources
GET    /{tenant}/modules/{module}/resources/{id}
PUT    /{tenant}/modules/{module}/resources/{id}
DELETE /{tenant}/modules/{module}/resources/{id}
POST   /{tenant}/webhook/{event}[/{module}[/{id}]]
POST   /{tenant}/public/webhook/{event}[/{module}[/{id}]]
POST   /{tenant}/files
```

OpenAPI can omit supported query parameters and workflow webhooks. Inspect live routes/module metadata and product workflows when exact behavior matters.

## Mandatory Write Rules

1. Fetch the current resource immediately before writing.
2. Verify tenant, module, resource ID, client ownership, and target relations.
3. PUT is partial only at the top level.
4. A supplied `list` field replaces the complete list.
5. Preserve nested row IDs while editing; remove IDs while duplicating.
6. Send relations as `{ "id": 123, "module_id": 6 }`.
7. Send JSON/map fields as native JSON, not encoded JSON strings.
8. Omit fields that should remain unchanged.
9. Read back every mutation and verify exact paths/count/order.
10. Treat workflow side effects and `workflow_errors` as part of the operation result.

List semantics:

```text
field omitted -> unchanged
field: null   -> unchanged
field: []     -> cleared
field: [...]  -> complete replacement
```

## Filters

Canonical filters use disjunctive normal form:

```json
[
  [
    {"field": "website.id", "operator": "=", "value": 123},
    {"field": "status", "operator": "!=", "value": "draft"}
  ],
  [
    {"field": "owner.id", "operator": "=", "value": 456}
  ]
]
```

Outer groups are OR; conditions inside one group are AND. Legacy `column` can be accepted, but use `field` for new automation.

Useful list parameters include `page`, `perPage`/`results`, `columns`, `with`, `depth`, `pre_filters`, `filters`, `sortField`, and `sortOrder`.

## Responses

```json
{"success": true, "resource": {}, "eventResponse": null}
```

```json
{"success": true, "resource": {}}
```

```json
{"success": true}
```

Bulk reads commonly return paginator metadata plus `data`. Singular reads usually return the entity directly. File upload returns `{success,data}`. Field policy can omit unauthorized fields; missing does not always mean null.

## Webhooks

Use POST. Top-level request fields are available to workflows as `request`. Reserved keys such as `prototype`, `input`, `value`, `selected`, and `context` are hydrated separately. A resource ID in the URL becomes workflow input `default`.

An empty HTTP 200 can be a valid successful invocation. Only synchronous `action/response` output becomes the immediate HTTP body. Poll persisted state for async work.

## Files

Use multipart form data at `POST /{tenant}/files`, not module resource CRUD.

```text
file       uploaded binary
module     optional; defaults to files
parent_id  preferred verified directory entity ID
path       alternative virtual path
overwrite  optional boolean
```

Verify that `parent_id` resolves in the selected files module and has `directory=true`. An unknown ID can become a root upload. Avoid unchecked `path`: a typo can create a directory. Product roles may forbid root uploads.

## Tooling

`scripts/brezel_call.py` makes dry-run-by-default API calls and `scripts/json_peek.py` inspects saved JSON locally. They are files of this skill: read them with `read_skill` (`file`) and write them into the shell workspace once per run (a heredoc), then run them there.

```bash
python3 brezel_call.py modules
python3 brezel_call.py list pages --filters-json filters.json --columns id,label,name
python3 brezel_call.py get pages 123 --path slots.0.sections
python3 brezel_call.py update pages 123 --data-file update.json
python3 brezel_call.py update pages 123 --data-file update.json --execute
python3 brezel_call.py webhook buildSite --module websites --resource-id 456 --execute
```

Mutation commands print the intended request unless `--execute` is present. Before `--execute` on a write, tell the person what will change in the external instance unless they asked for exactly that change.

## Reference

Read `references/api.md` for endpoint details, SDK signatures, relation/list behavior, upload contracts, and inspection procedures.
