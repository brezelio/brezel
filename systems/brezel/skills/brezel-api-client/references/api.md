# Brezel API Reference

Compatibility: production Brezel API 3.43.0 and linked 3.47.1 source, audited 2026-07-28.

## Tenant And Authentication

The path-style base is:

```text
<base-url>/<tenant>
```

The tenant selects the system and client. Do not send or override `client_id`. API keys authenticate as users, so client, role, module, field, and entity policies apply.

Preferred headers:

```http
X-API-Key: <secret>
Accept: application/json
Content-Type: application/json
```

Bearer auth can also be enabled. Never use query/body API-key transport even if a server accepts it.

## Resource Endpoints

```text
GET    /{tenant}/modules
GET    /{tenant}/modules/{module}
GET    /{tenant}/modules/{module}/resources
POST   /{tenant}/modules/{module}/resources
GET    /{tenant}/modules/{module}/resources/{id}
PUT    /{tenant}/modules/{module}/resources/{id}
DELETE /{tenant}/modules/{module}/resources/{id}
```

Production 3.43.0 OpenAPI advertises singular `/resources/aggregate`; a linked 3.47.1 checkout uses plural `/resources/aggregates`. Probe compatibility-sensitive endpoints rather than relying on copied specs.

### Responses

Create:

```json
{
  "success": true,
  "resource": {},
  "eventResponse": null
}
```

Update:

```json
{"success": true, "resource": {}}
```

Delete:

```json
{"success": true}
```

Validation normally returns HTTP 400 with `success:false` and `errors`. Lifecycle failures can be returned in `workflow_errors`. A delete can remove the entity before a post-delete workflow fails; inspect both fields and product state.

Singular GET usually returns an entity directly. List GET returns a paginator with `data` plus keys such as `current_page`, `last_page`, `per_page`, and `total`.

## Query Parameters

Supported parameters can include:

```text
page
perPage
results
columns
with
depth
pre_filters
filters
name
sortField
sortOrder
includeTrashed
```

`columns` can be a JSON array or comma-separated value. `with` is normally a JSON array. A singular GET loads relations/lists broadly; reduce output locally.

Filters use DNF:

```json
[
  [
    {"field": "website.id", "operator": "=", "value": 123},
    {"field": "status", "operator": "=", "value": "active"}
  ],
  [
    {"field": "owner.id", "operator": "=", "value": 456}
  ]
]
```

Outer groups are OR, inner conditions are AND. One-dimensional arrays can be normalized to one AND group. `column` is legacy; use `field`.

## Persistence Semantics

PUT updates only supplied top-level fields and recipe-dependent fields. There is no per-entity PATCH route. A collection-level PATCH can exist for bulk deletion; do not confuse it with partial entity update.

List fields use replacement semantics:

```text
omitted -> unchanged
null    -> unchanged
[]      -> clear
array   -> complete replacement
```

List rows can contain `id`, `index`, relations, and nested lists. Input order determines order unless explicit indexes are supplied. Preserve existing row IDs during edits. Remove row IDs recursively during duplication.

## Relations

Write scalar relations as:

```json
{"id": 123, "module_id": 17}
```

Write multiselect relations as arrays of those stubs. Use `null` to clear a scalar relation and `[]` to clear a multiselect. Resolve module IDs in the target environment.

Responses can include fuller nested relation objects. Do not send those full objects back unless required; full objects can include stale or unauthorized fields.

## JSON And Map Fields

Send native objects/arrays:

```json
{"settings": {"enabled": true, "limit": 10}}
```

Do not send:

```json
{"settings": "{\"enabled\":true,\"limit\":10}"}
```

Field-specific schema still comes from module metadata/product source.

## Webhooks

Protected routes:

```text
POST /{tenant}/webhook/{event}
POST /{tenant}/webhook/{event}/{module}
POST /{tenant}/webhook/{event}/{module}/{resourceId}
```

Public routes use `/public/webhook/`, but an event is public only when its workflow declaration says so.

Workflow inputs:

- `request`: all top-level request fields.
- `input`, `value`, `selected`: matching top-level reserved members.
- `prototype`, `context`: hydrated matching members.
- `default`: resource bound through the URL, if present.

Empty HTTP 200 is valid when no synchronous response action runs. Async workflows are acknowledged before completion. Poll product state.

## File Uploads

Small files:

```http
POST /{tenant}/files
Content-Type: multipart/form-data
```

```text
file       required binary
module     optional, defaults to files
parent_id  verified directory entity ID
path       alternative virtual path
overwrite  optional boolean
```

Response:

```json
{"success": true, "data": {"id": 123, "module_id": 9}}
```

Verify that `parent_id` resolves in the selected files module and has `directory=true`. An unknown ID can resolve to no parent/root. A missing `path` can be created automatically, so never use unverified user input as a path. Large-file multipart session endpoints can exist under `/files/uploads/multipart/*`.

## JavaScript SDK

Current package:

```js
import Client from '@brezel/api-client'
```

Relevant signatures in the audited SDK:

```js
client.fetchModules()
client.fetchModule('pages')
client.fetchEntities('pages', options)
client.fetchEntity(id, 'pages')
client.createEntity('pages', payload, params)
client.updateEntity('pages', id, payload, params)
client.saveEntity('pages', payload, params)
client.deleteEntity('pages', entity)
client.fireEvent('buildSite', 'websites', website, payload)
client.fetchFile(id)
```

Check the installed package before coding because constructor/export details can differ by package version. Do not use the obsolete package name `@brezel-js/api-client`.

## Safe Mutation Procedure

1. Fetch and cache the current entity.
2. Confirm ownership and `updated_at`.
3. Identify the smallest top-level field that contains the target.
4. Preserve all unrelated nested rows/fields.
5. Print/dry-run the request.
6. Execute.
7. Read back and compare exact target, IDs, count, and order.
8. Check lifecycle side effects and `workflow_errors`.

## Progressive Inspection

```bash
python3 scripts/brezel_call.py list pages \
  --columns id,label,name \
  --filters-json /tmp/page-filter.json \
  --save /tmp/pages.json

python3 scripts/json_peek.py --load /tmp/pages.json --keys
python3 scripts/json_peek.py --load /tmp/pages.json --pick id,label,name
python3 scripts/json_peek.py --load /tmp/pages.json --path data.0
```

Reduce bulk requests server-side, cache once, then inspect locally. Truncate large code/HTML fields with `--max-string`.
