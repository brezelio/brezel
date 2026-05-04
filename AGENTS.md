# AGENTS.md

Framework-oriented guidance for agentic coding in Brezel projects.
This document is intentionally reusable across early-stage and mature systems.

Use this as a practical field guide when there are no good local examples yet.

## Core mindset
- Brezel is declarative first: most behavior is defined by JSON resources, not ad-hoc imperative code.
- Work usually happens under `systems/<system>/`.
- A feature is usually cross-resource: module + layouts + translations + roles + menu + optional workflows/seeds/widgets.
- When changing existing functionality, keep identifiers stable (module ids, field ids, workflow identifiers, button keys).

## Agent quickstart (first pass in any Brezel repo)
1. Identify target system(s) in `systems/`.
2. Read `systems/<system>/system.json` for loader and bakery behavior.
3. Index existing resources (`config/*.module.bake.json`, `config/*.layout.*.json`, `workflows/*.workflow.json`, `translations/*.json`, `roles/*.bake.json`, `menus/*.menu.bake.json`).
4. Build an identifier map:
   - modules (`resource_module`)
   - fields per module (`fields[].identifier`)
   - workflows (`identifier` + `events[]`)
   - buttons (`resource.buttons` keys)
5. For any feature change, trace all affected links before editing:
   - module field usage in layouts
   - translation keys
   - role permissions
   - workflow triggers/buttons

## Brezel model
- Main resource families: modules, layouts, entities/seeds, menus, roles, workflows, translations, hostnames/topbar.
- Typical structure:

```text
systems/<system>/
  config/  menus/  roles/  workflows/  recipes/  translations/  views/
  system.json  hostnames.bake.json  topbar.bake.json
```

## Naming conventions
- `<name>.module.bake.json` - module definition
- `<name>.entities.bake.json` - entity/seed resources
- `<name>.layout.detail.json`, `<name>.layout.index.json`, optional `<name>.layout.summary.json`
- `<name>.menu.bake.json` - menu
- `role.<name>.bake.json` - role seed
- `<name>.workflow.json` - workflow
- Layout files are plain JSON (no bakery envelope)

## Bakery resource syntax
Most `*.bake.json` files are arrays of resources using a typed key and `resource` payload:

```json
[
  {
    "resource_module": "projects",
    "resource": {
      "identifier": "projects"
    }
  }
]
```

Common typed keys:
- `resource_module`
- `resource_entity`
- `resource_user`
- `resource_client`
- `resource_view`
- `resource_menu`
- `resource_layout`
- `resource_translations`
- `resource_hostname`

Useful template references inside `resource` payloads:
- `${resource_entity.role_admin}`
- `${resource_client.global}`
- `${resource_hostname.wrs.hostname}`
- `${file('views/pdf/invoice.twig')}`
- `${trimFile('recipes/showExportIfAppropriate.recipe')}`
- `${env('ROOT_PASSWORD', 'secret')}`

## Modules (core)
Modules define data model, UI linkage, and optional button actions.

Common module keys:
- `identifier`, `icon`, `title`
- optional `type` (for framework-native modules like `users`, `roles`, `clients`, `files`, `views`)
- `fields` (array)
- `layouts` (`detail`, `index`, optional `summary`)
- `options` (`single_entity`, `param_scopes`, etc.)
- `buttons` (custom actions, often workflow-triggered)

### How-to: reference detail/index/summary layouts
Use system-relative paths without `.json`:

```json
"layouts": {
  "detail": "config/invoices.layout.detail",
  "index": "config/invoices.layout.index",
  "summary": "config/invoices.layout.summary"
}
```

### How-to: use inline file-loaded layout (advanced)
Useful for index-only virtual modules/widgets:

```json
"layouts": {
  "index": "${file('/config/indexer.index.json')}"
}
```

### How-to: add project scoping on a module

```json
"options": {
  "param_scopes": ["project"]
}
```

### How-to: configure single-record settings module

```json
"options": {
  "single_entity": true,
  "param_scopes": ["project"]
}
```

### How-to: wire a module button to a workflow webhook
Button key should match workflow event identifier.

```json
"buttons": {
  "StartDocumentExport": {
    "icon": "material-symbols-light:export-notes-outline",
    "forceTitle": true,
    "show_in": ["module.show"]
  }
}
```

Matching workflow event:

```json
{
  "identifier": "StartDocumentExport",
  "type": "webhook",
  "module": "documents"
}
```

## Fields (syntax + semantics)
Typical field shape:

```json
{
  "identifier": "invoiced",
  "type": "checkbox",
  "options": { "default": false }
}
```

Common field types:
- `text`, `textarea`, `number`, `currency`, `checkbox`, `choice`
- `select`, `multiselect`
- `email`, `tel`, `password`
- `date`, `datetime`
- `file`
- `incrementing`
- `json`, `list`
- `code`, `wysiwyg`

Type guidance:
- Boolean state -> `checkbox`
- Closed finite values -> `choice` + `options.values`
- Relation -> `select` / `multiselect` + `options.references`
- Repeatable nested structure -> `list` + nested `options.fields`
- Computed values -> `recipe` on field

Frequently used options:
- Validation/defaults: `rules`, `default`
- UI behavior: `readonly`, `frontend_disabled`, `hidden_from_frontend`, `show_in`, `show_in_resource_table`
- Relation/file: `references`, `pre_filters`, `add_options`, `multiple`
- UX/help/security: `help`, `placeholder`, `hide_value`, `ignore_when_empty`

### How-to: relation filtered by another selected field

```json
{
  "identifier": "contact",
  "type": "select",
  "options": {
    "references": "contacts",
    "pre_filters": [
      { "column": "customer.id", "operator": "=", "field": "customer.id" }
    ]
  }
}
```

### How-to: computed currency totals

```json
{ "identifier": "net_sum", "type": "currency", "recipe": "sum(positions[*].total_price)" }
```

### How-to: conditional field visibility/editability

```json
"options": {
  "recipes": {
    "hidden_from_frontend": "this.type != 'customer'",
    "frontend_disabled": "from_customer"
  }
}
```

### How-to: nested list field

```json
{
  "identifier": "positions",
  "type": "list",
  "options": {
    "fields": [
      { "identifier": "position_text", "type": "text" },
      { "identifier": "quantity", "type": "number" },
      { "identifier": "unit_price", "type": "currency", "options": { "currency": "EUR" } }
    ]
  }
}
```

## Module references and pre-filters
References connect modules via `options.references`.

Pre-filter operators: `=`, `!=`, `>`, `<`, `>=`, `<=`, `IN`, `NOT IN`, `LIKE`.

Pre-filter sources:
- `field` (field path)
- `recipe` (dynamic expression)
- `value` (literal)

How-to examples:
- Field-to-field filter:

```json
{ "column": "customer.id", "operator": "=", "field": "customer.id" }
```

- Recipe-based filter:

```json
{ "column": "project.id", "operator": "=", "recipe": "this.project.id" }
```

- Conditional filter (apply only when expression is true):

```json
{
  "column": "project.id",
  "operator": "=",
  "recipe": "getCurrentProjectId()",
  "if": "getCurrentProjectId() != null"
}
```

## Layouts (primary UI config)
Layouts are tab -> row -> col -> component trees.

Common component types:
- `headline`
- `field_group`
- `resource_table`
- `files`
- `widget`
- `text`

Important layout semantics:
- `field_group.options.fields` can include nested arrays for inline groups.
- `resource_table` supports module binding, column config, toolbar controls, pre-filters, aggregates, summary widgets.
- Visibility/behavior can be recipe-driven at tab/component level.
- `show_in` controls contexts (`module.show`, `module.edit`, etc.).

### How-to: build a simple detail layout

```json
{
  "tabs": [
    {
      "identifier": "general",
      "rows": [
        {
          "cols": [
            {
              "span": 24,
              "components": [
                { "type": "headline", "options": { "identifier": "basic_information" } },
                { "type": "field_group", "options": { "fields": ["name", "customer"] } }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### How-to: group inline form fields

```json
"fields": [
  "name",
  ["street", "city"],
  ["postal_code", "country"]
]
```

### How-to: embed a child module table in a parent detail view

```json
{
  "type": "resource_table",
  "options": {
    "module": "contacts",
    "pre_filters": [
      { "column": "customer.id", "operator": "=", "recipe": "this.id" }
    ],
    "create_in_modal": true,
    "edit_in_modal": true,
    "show_in_modal": true,
    "recipes": {
      "fill": "{'customer': this, 'from_customer': true}"
    }
  }
}
```

### How-to: mount filesystem view in layout

```json
{
  "type": "files",
  "options": {
    "module": "files",
    "recipes": {
      "directory": "wrs.pathForProject(this, false)",
      "hidden_from_frontend": "!id"
    }
  }
}
```

### How-to: add role-based tab visibility

```json
"options": {
  "recipes": {
    "hidden_from_frontend": "hasRole('customer')"
  }
}
```

## Recipes (`.recipe` + inline)
Recipes are JS-like expressions for dynamic behavior and logic.
They are however purely _expressions_, not full scripting environments, so no `const foo` or similar.
Recipe-Expressions should be kept short.

Where recipes appear:
- `field.options.recipes`
- layout/tab/component `options.recipes`
- `buttons.<name>.recipes`
- `pre_filters[].recipe`
- workflow nodes (`op/recipe`, `.recipe` slots in options)

Core model:
- `this` = current entity in module/layout contexts
- `$var` = workflow variable in workflows
- role helpers like `hasRole()`, `isRoot()`
- utility helpers like `trimFile()`, `file()` during bakery template evaluation

Common recipe examples:
- `this.status == 'approved'`
- `!!this.id`
- `!this.destroyed`
- `sum(positions[*].total_price)`
- `getCurrentProjectId() != null`
- `foo ? bar : baz` (Or even nested ternaries)

> You can find functions that are available for recipes that are used in the backend (i.e. workflows) in
> `@vendor/brezel/api/app/Recipes/Driver/Native/Interpreter/Main/MainInterpreter.php`
>
> The recipes available to the frontend (i.e. in layouts) are often quite similar.

### How-to: extract long expression into reusable recipe file
In `systems/<system>/recipes/showExportIfAppropriate.recipe`:

```javascript
(
this.status == 'approved' ||
this.status == 'export_error' ||
this.status == 'exported'
) && !hasRole('customer')
```

Use it from JSON:

```json
{
  "recipes": {
    "display": "${trimFile('recipes/showExportIfAppropriate.recipe')}"
  }
}
```

### How-to: add custom recipe package/symbols
- Backend workflow/native recipes:
  - Register package in `app/Providers/RecipeServiceProvider.php` (for example `wrs` package).
  - Wire provider in `bootstrap/app.php`.
- Frontend layout/module recipes:
  - Register symbols/functions in `src/main.js` via `extendRecipeProvider(...)`.

## Widgets
Widgets are custom Vue components mounted from layouts.

Create/register/use flow:
1. Create component in `src/components`.
2. Register in bootstrap (usually `src/main.js`):
   - `app.component("TopBar", TopBar)`
   - `app.component("Indexer", Indexer)`
   - `app.component("Releaser", Releaser)`
3. Use in layout:

```json
{
  "type": "widget",
  "options": {
    "widget": "custom",
    "component": "Indexer",
    "dynamic_height": true
  }
}
```

Framework integration (`@kibro/brezel-spa`):
- Typical flow: load module/entity data, execute workflow/layout commands, persist via API helpers.
- Ant Design Vue components are available through `<a-...>` tags.

### How-to: use generated Brezel types in widgets (important)
These types are generated from system config and should be used in widget code.

1. Ensure `systems/<system>/system.json` enables type generation:

```json
"bakery": {
  "apply": {
    "generate-types": {
      "enabled": true,
      "package": "@kibro/brezel-spa-types"
    }
  }
}
```

2. Regenerate by running `php bakery apply` (or project wrapper like `bin/u`).
3. Import generated entities/modules in widgets from `src/types/modules`.

Example (from this project style):

```ts
import { Module } from '@kibro/brezel-spa'
import { Project, Document as DocumentEntity } from '../types/modules'

const projectsModule = Module.byIdentifier('projects')
const project = (await projectsModule.getEntity(projectId)) as Project
```

Notes:
- Generated files usually live under `src/types/` (`modules/`, `translations/`, and `custom-modules.d.ts`).
- `custom-modules.d.ts` augments `@kibro/brezel-spa` types automatically.
- Do not hand-edit generated files in `src/types/**`; regenerate from bakery config instead.

## Workflows
Workflows handle business automation, side effects, imports/exports, and integrations.

High-level shape:
- metadata: `identifier`, `entry`, `async`, `queue`, `elements`, `events`
- trigger node: usually `event/webhook` or `event/create`
- logic nodes: `flow/if`, `flow/each`, `flow/try`, `op/set`, `source/entities`, `action/save`, `action/run`, etc.

Common node types seen in production Brezel apps:
- Events: `event/webhook`, `event/create`
- Data loading/creation: `source/entities`, `source/new`, `op/load`, `op/get`
- Logic/control: `flow/if`, `flow/empty`, `flow/each`, `flow/try`
- Mutations: `op/set`, `op/addListItem`, `op/push`, `action/save`, `action/delete`
- Side effects: `action/run`, `action/notify`, `action/log`, `action/redirect`, `action/export`, `action/response`, `cast/progress`, `action/makeDir`

> You can find available workflow elements and their code / definition in `@vendor/brezel/api/app/Workflow/Elements/*`.

### How-to: webhook workflow triggered by module button
1. Add module button key (for example `RenderInvoice`).
2. Create workflow with matching event identifier in `events[]`.
3. Ensure event `module` equals the module where button lives.
4. Add translation under `buttons.RenderInvoice`.

### How-to: lifecycle workflow
Use `event/create` to react to entity creation:

```json
{
  "identifier": "OnProjectCreateCreateFolders",
  "type": "create",
  "module": "projects"
}
```

### How-to: queue long-running work
- Set workflow-level `async: true` and a `queue` name.
- Use `action/run` to fan out per-item processing.
- Ensure workers consume those queues in dev/prod.

### How-to: expose external webhook endpoint
- Create `event/webhook` workflow (module can be `null` for global endpoints).
- Parse request payload (`request:` / `request.field:`).
- Return explicit responses with `action/response` for integration reliability.

Important operational note:
- Workflow JSON changes usually require `php bakery load` (or project wrappers like `bin/l` / `bin/u`), not only `php bakery apply`.

## Entities/seeds, depends_on, and policy
`*.entities.bake.json` seeds default records and references.

Use `depends_on` when referencing resources that must exist first.
Format: `<typed_key>.<resource_identifier>`.

Examples:
- `resource_module.roles`
- `resource_entity.role_admin`
- `resource_client.global`

Policies used in real projects:
- `sync` - keep resource aligned with spec
- `detach` - preserve manually changed runtime records in many setups

How-to example:

```json
[
  {
    "resource_entity": "role_admin",
    "depends_on": "resource_module.roles",
    "policy": "sync",
    "resource": {
      "module": "roles",
      "client": "${resource_client.global}",
      "fields": {
        "slug": "admin"
      }
    }
  }
]
```

## Menus
Menus define navigation entries and submenus.

How-to:
- Add a module by identifier string in `elements`.
- Add nested submenu with object entries.
- Mark default landing entry with `"default": true`.

```json
{
  "resource_menu": "main",
  "resource": {
    "name": "main",
    "elements": [
      { "name": "projects", "type": "entry", "default": true },
      {
        "name": "settings",
        "type": "submenu",
        "icon": "mdi:text-box-multiple-outline",
        "elements": ["export_settings", "transfer_settings"]
      }
    ]
  }
}
```

## Roles and permissions
Roles are usually seeded via `role.<name>.bake.json` as role entities in `roles` module.

Common patterns:
- Full access role: `"modules": true`
- Locked-down role: per-module CRUD + per-field read/write + optional filters

Field-level permissions example:

```json
"modules": {
  "documents": {
    "read": true,
    "create": false,
    "update": false,
    "delete": false,
    "fields": {
      "status": { "read": true, "write": false }
    }
  }
}
```

Data filter example (user-bound):

```json
"filter": [
  [
    {
      "field": "customer.id",
      "operator": "=",
      "mode": "user",
      "user": "customer.id"
    }
  ]
]
```

## Translations
Translations are usually loaded by a `resource_translations` envelope referencing a JSON file.

Envelope example:

```json
{
  "resource_translations": "de",
  "resource": {
    "identifier": "de",
    "code": "de_DE",
    "provider": "deDE",
    "data": "${file('translations/de.json')}"
  }
}
```

Common translation keys to maintain:
- `buttons.<ButtonIdentifier>`
- `modules.<module>.title`
- `modules.<module>.fields.<field>`
- `modules.<module>.choice.<field>.<value>`
- `modules.<module>.tabs.<tab>`
- `modules.<module>.headlines.<headline>`
- `modules.<module>.help.<field>`
- `modules.<module>.summary.<key>`
- `modules.<module>.widget...`

Rule of thumb: whenever adding fields/buttons/tabs/headlines, add translation keys in the same change.

## Other system-level resources
- `system.json`: loaders and bakery options (for example type generation)
- `hostnames.bake.json`: hostname resources
- `topbar.bake.json`: top bar layout resource (`resource_layout`, `type: top_bar`)

## Common playbooks

### 1) Add a new field to an existing module
1. Add field in `<module>.module.bake.json`.
2. Add field to relevant detail/index/summary layouts.
3. Add translations for new label/help/choices.
4. Update roles if field visibility/editability is constrained.
5. Update workflows if business status or side effects depend on that field.

### 2) Add a new module end-to-end
1. Create `<name>.module.bake.json` with `identifier`, `title`, `fields`, `layouts`.
2. Create `<name>.layout.detail.json` and usually `<name>.layout.index.json`.
3. Add menu entry in `menus/*.menu.bake.json`.
4. Add `modules.<name>` translations.
5. Add/adjust role permissions.
6. Add seeds (`<name>.entities.bake.json`) if defaults are required.
7. Add workflows/buttons only if the module needs automation/actions.

### 3) Add a button-driven action workflow
1. Add button key under module `buttons`.
2. Create workflow file with same `identifier` and matching `events[]` webhook entry.
3. Implement business steps (`source/entities`, `op/set`, `action/save`, `action/run`, etc.).
4. Add `buttons.<identifier>` translation label.
5. Verify button visibility (`show_in`, recipe display conditions).

### 4) Add child table management in parent detail view
1. Ensure child module has relation field to parent.
2. Add `resource_table` to parent detail tab with `pre_filters` on parent id.
3. Optional: use modal create/edit/show and prefill parent relation with `recipes.fill`.

## Fresh project bootstrap order (minimal)
When a project is almost empty, this order avoids dependency issues:
1. `system.json`
2. `hostnames.bake.json`
3. core modules needed by others (for example `roles`, `users`, `clients`, `files`)
4. role/client/user seeds (with proper `depends_on`)
5. business modules + layouts
6. menus
7. translations envelope + locale file
8. workflows
9. optional widgets/topbar/custom recipes

## Validation and dev loop
Typical commands (project-specific wrappers may exist):
- `php bakery plan` - inspect upcoming changes
- `php bakery apply` - apply non-workflow resources
- `php bakery load` - reload workflows
- `bin/u` or `mise run update` - project wrapper for apply + load

If workflows use queues (`async: true`):
- run workers for required queues (for example `php bakery queue:work --queue=<queue_name>`)

## Final validation checklist
- JSON syntax valid and file naming matches purpose.
- Bakery envelope key matches file intent (`resource_module`, `resource_entity`, etc.).
- Module/layout/reference identifiers resolve.
- New field is reflected in module + layout + translations (+ roles if needed).
- Button identifiers align with workflow event identifiers.
- Recipes are valid in their execution context (`this` vs `$vars`).
- Widgets used in layout are registered in frontend bootstrap with exact matching name.
- `depends_on` covers all seed dependencies.
- Changes were applied/loaded with correct bakery command (`apply` vs `load`).
