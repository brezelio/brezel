# AGENTS.md

Framework-oriented guidance for agentic coding in Brezel projects.
This document is intentionally reusable across early-stage and mature systems.

Use this as a practical field guide when there are no good local examples yet.

## Sources and verification order
- Start with examples in the current system because they reflect the installed Brezel version and local conventions.
- Consult the official handbook at https://docs.brezel.io/ for concepts, guides, and reference material.
  - > Note: The handbook is useful but currently incomplete and not consistently organized. Do not assume that every supported feature is documented or that every example matches the installed version.
- When local examples and the handbook are insufficient or disagree, inspect the installed `vendor/brezel/api` implementation for backend behavior and the installed `@kibro/brezel-spa` package for frontend behavior.
- Do not infer behavior from similarly named options. Verify workflow element semantics in `vendor/brezel/api/app/Workflow/Elements/*`.

## Core mindset
- Brezel is declarative first: most behavior is defined by JSON resources, not ad-hoc imperative code.
- Work usually happens under `systems/<system>/`.
- A feature is usually cross-resource: module + layouts + translations + roles + menu + optional workflows/widgets or pre-seeded entities.
- When changing existing functionality, keep identifiers stable (module ids, field ids, workflow identifiers, button keys, etc.).
- Always look at available examples for similar features in the same system. I.e. If you need to react to entity creation, look at existing workflows with `event/create` triggers.

## Hard boundary: no application PHP or Laravel logic
Brezel systems must not contain raw PHP application logic or custom Laravel integration. Do not create controllers, services,
commands, jobs, models, middleware, generic service providers, or similar PHP classes inside a Brezel project.

Use this escalation order for complex behavior and integrations:
1. Implement it with existing Brezel resources, especially workflows and recipes.
2. If that is insufficient, expose the smallest self-contained PHP operation as a custom backend recipe function through the project's recipe provider. This is the only allowed PHP escape hatch. Keep it stateless and expression-oriented; it must not hook into the underlying Laravel of the Brezel framework!
3. If a recipe function is still insufficient, stop and ask the developer. The capability may belong in Brezel core rather than being custom build for this brezel-based project.

If no custom recipe provider exists yet, follow the registration process under "How-to: add custom recipe package/symbols" below. Do not invent another PHP integration mechanism.

## Core Style guide
When writing Code (PHP, JS, TS, json):
- Use camelCase for variables and functions, PascalCase for classes, and UPPER_CASE for constants.
- Use 2 spaces for indentation, not tabs.

When writing `json`:
- Prefer to put each key-value-pair / array entry on its own line, even for small objects / arrays. This makes diffs easier to read and review.
- Sort object keys by "size". I.e. put single-line keys first, then small objects, then larger objects. This makes it easier to find things in a file.
- Use `"` for all keys and string values
- Use `true` / `false` / `null` for boolean and null values, not `"true"` / `"false"` / `"null"`. As well as use bare numbers, not strings for numeric values (i.e. field type `number` seeded entities.)

When building Workflows (JSON):
- Do not stack elements. Arrange `meta.position` values so the workflow remains readable as a process map in the visual editor.
- Space normal left-to-right steps approximately 320 position units apart horizontally and parallel branches approximately 220 units apart vertically. Treat these as readability defaults inferred from editor-authored workflows, not enforced grid requirements.
- Keep the workflow tree as flat as possible. Avoid deep nesting of `flow/if` and `flow/each` elements. Use element-level `set` mappings to capture outputs as temporary workflow variables.

When building Widgets (Vue components):
- Prefer Typescript
- Prefer `<script setup>` style

## Agent quickstart (first pass in any Brezel repo)
1. Identify target system(s) in `systems/`.
2. Index existing and for your task relevant resources (modules: `*.module.bake.json`, layouts: `*.layout.*.json`, workflows: `*.workflow.json`, translations (plan .json, often in an extra `translations` dir: `translations/*.json`, roles (normal `.bake.json`, often in a `roles` dir or with roles in the name): `*role*.bake.json`, menus: `*.menu.bake.json`).
3. Build an identifier map:
   - modules (`resource_module`)
   - fields per module (`fields[].identifier`)
   - workflows (`identifier` + `events[]`)
   - buttons (`resource.buttons` keys)
4. For any feature change, trace all affected links before editing:
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

> Those are just conventions though!
> What matters is the `.bake.json` ending for bakery definitions and then the `resource_*` envelope keys inside there
> and the `.workflow.json` ending for workflows.

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

### How-to: add project parameter-based scoping on a module
Useful to define a URL parameter that can be read by widgets or filters (e.g. resource table pre-filters) to "scope" the
entire system to e.g. a project to pre-filter things in order to just show relevant entities for that selected project.

```json
"options": {
  "param_scopes": ["project"]
}
```

### How-to: configure single-record settings module
Often used to turn the `clients` module into a system wide "system settings" type thing when multiple clients are not needed.

```json
"options": {
  "single_entity": true,
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

> Buttons have many more options, eg. show_in, hidden, icon, display etc.
>
> Like in most other option-based situation, the button-options can be calculated dynamically by reusing the same key 
> but nested in a `recipes` object with a recipe expression as a value.
> E.g. `buttons.foo.recipes.display = '!bar'` to only show the `foo` button when the `bar` field is falsy (like an
> unchecked `checkbox` field).

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
- Computed value -> `recipe` on field

Frequently used `options`:
- Validation/defaults: `rules`, `default`
- UI behavior: `readonly`, `frontend_disabled`, `hidden_from_frontend`, `show_in`, `show_in_resource_table`
- Relation/file: `references`, `pre_filters`, `add_options`, `multiple`
- UX/help/security: `help`, `placeholder`, `hide_value`, `ignore_when_empty`
- Dynamic options: `recipes` (for example `hidden_from_frontend: "!hasRole('admin')"`)

### How-to: relation filtered by another selected field

```json
{
  "identifier": "contact",
  "type": "select",
  "options": {
    "references": "contacts",
    "pre_filters": [
      { 
        "column": "customer.id",
        "operator": "=",
        "field": "customer.id"
      }
    ]
  }
}
```

### How-to: computed currency totals

```json
{ 
  "identifier": "net_sum", 
  "type": "currency", 
  "recipe": "sum(positions[*].total_price)" 
}
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

Do not use `options.recipes.hidden_from_frontend` on fields nested inside a `list` field. It breaks the layout. Prefer conditionally disabling nested fields with `options.recipes.frontend_disabled` instead.

```json
{
  "identifier": "positions",
  "type": "list",
  "options": {
    "fields": [
      { 
        "identifier": "position_text",
        "type": "text"
      },
      { 
        "identifier": "quantity",
        "type": "number"
      },
      { 
        "identifier": "unit_price",
        "type": "currency",
        "options": { 
          "currency": "EUR" 
        } 
      }
    ]
  }
}
```

## Module references and pre-filters
References connect modules via `options.references`.

Pre-filter operators: `=`, `!=`, `>`, `<`, `>=`, `<=`, `IN`, `NOT IN`, `LIKE`, `NOT LIKE`.

Pre-filter sources:
- `field` (field path)
- `recipe` (dynamic expression)
- `value` (literal)

How-to examples:
- Field-to-field filter:

```json
{ 
  "column": "customer.id",
  "operator": "=", 
  "field": "customer.id" 
}
```

- Recipe-based filter:

```json
{ 
  "column": "project.id", 
  "operator": "=",
  "recipe": "this.project.id" 
}
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
Col-span is 24-based (like bootstrap grid).

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
- `show_in` controls contexts (commonly used: `module.show`, `module.edit`, `module.create`, `module.index`).

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
                { 
                  "type": "headline", 
                  "options": { 
                    "identifier": "basic_information" 
                  } 
                },
                { 
                  "type": "field_group", 
                  "options": { 
                    "fields": [
                      "name", 
                      "customer"
                    ] 
                  } 
                }
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
  [
    "street", 
    "city"
  ],
  [
    "postal_code", 
    "country"
  ]
]
```

### How-to: embed a child module table in a parent detail view

```json
{
  "type": "resource_table",
  "options": {
    "module": "contacts",
    "pre_filters": [
      { 
        "column": "customer.id",
        "operator": "=", 
        "recipe": "this.id" 
      }
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
    "directory": "/foo/bar/",
    "recipes": {
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
- In workflow recipes, use `??` for fallback values, for example `$customer ?? $defaultCustomer`. Do not use `||` as a value fallback: in the workflow recipe interpreter that produces a boolean (as it is an "or" expression) rather than returning one of the operands.

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
This is useful for extending recipes with custom, more complex logic when workflows and existing recipe functions are insufficient.
A custom backend recipe function is the only allowed PHP escape hatch. It must be a small, self-contained, stateless operation
that follows the expression model of recipes. Do not use it to introduce controllers, services, jobs, generic Laravel service
providers, application state, or other Laravel application architecture.

#### Backend workflow recipes

1. Ensure the project namespace maps to `app/` in `composer.json`:

```json
"autoload": {
  "psr-4": {
    "Project\\": "app/"
  }
}
```

2. Create a package whose public methods become namespaced recipe functions:

```php
<?php

declare(strict_types=1);

namespace Project\Recipes;

use App\Recipes\Driver\Native\Interpreter\Main\Library\Packages\Package;

class ProjectRecipes extends Package
{
  public function normalizeReference(string $reference): string
  {
    return strtoupper(trim($reference));
  }
}
```

3. Reuse an existing recipe provider or create the project's dedicated recipe provider: 
// TODO: where to put that file?

```php
<?php

declare(strict_types=1);

namespace Project\Providers;

use App\Recipes\Driver\Native\Interpreter\Main\MainInterpreter;
use App\Recipes\Driver\Native\NativeRecipesDriver;
use Illuminate\Support\ServiceProvider;
use Project\Recipes\ProjectRecipes;

class RecipeServiceProvider extends ServiceProvider
{
  public function boot(NativeRecipesDriver $recipes): void
  {
    $recipes->setInterpreterFactory(function (MainInterpreter $interpreter): void {
      $interpreter->registerPackage('project', ProjectRecipes::class);
    });
  }
}
```

4. Register only that recipe provider through the Brezel bootstrap:

```php
use Project\Providers\RecipeServiceProvider;

$brezel->addServiceProvider(RecipeServiceProvider::class);
```

The function is then available in workflow recipes as `project.normalizeReference($reference)`.

#### Frontend layout/module recipes

Backend and frontend recipes use separate interpreters.
If layouts, module fields, menus, or widgets need the same symbol, implement a frontend equivalent and register it independently:

```ts
export const projectRecipes = {
  normalizeReference(reference: string): string {
    return reference.trim().toUpperCase()
  },
}
```

```ts
import { extendRecipeProvider } from '@kibro/brezel-spa'
import { projectRecipes } from './recipes'

extendRecipeProvider((provider) => {
  provider.addSymbol('project', projectRecipes)
})
```

// TODO: Where? main.js?


This exposes `project.normalizeReference(reference)` to frontend recipes. Use `provider.addFunction('name', callback)` for an
un-namespaced function. If the function needs component state such as the current route, use the component argument supplied to
the provider callback. Keep backend and frontend implementations behaviorally aligned when the same recipe is available in both.
Add direct tests for non-trivial custom recipe functions.

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
- Typical flow: load module/entity data, execute workflow/layout commands, persist via API helpers exposed by that package.
- Ant Design Vue components are available through `<a-...>` tags and should be the prefered building blocks for custom widgets!

### How-to: use generated Brezel types in widget typescript (important)
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
- These generated type definitions can and should be included in the repo.

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

### Critical workflow semantics
- `op/set` does not create workflow variables. It writes object values onto the element's input object.
- For `op/set`, use the `in` port to specify the object whose values should be changed. `copy` is an optional source object whose fields are copied onto input entities; it does not select the mutation target.
- Create workflow variables with the top-level `set` mapping on any workflow element. Each key becomes a `$variable` available for elements "downstream", and its value selects an element output, for example `"set": { "entity": "default:" }` creates `$entity` with the value of the output of the `default` port of that workflow element. Important: those are NOT recipe expressions in there! Use `op/recipe` with a `default:` set if you want to write a more complex computed value to a variable.
- `action/run` with `scope: true` creates one variable per configured `input` key in the called workflow. The values do not become properties of `this`, the event prototype, or `$entry`.
- In workflow recipes, use `??` for value fallback. Do not use `||` for either/or values because it evaluates to a boolean in the workflow recipe interpreter.

> You can find available workflow elements, their available options and their code (to understand how they work and what they do in `@vendor/brezel/api/app/Workflow/Elements/*`.

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
- Set workflow-level `async: true` and optionally a `queue` name.
- Use `action/run` to fan out per-item processing by calling another workflow. That can either be sync or async (i.e. spawning another job).
- In prod custom queue names are automatically spun up via supervisor, locally they need to be started manually (for example `php bakery work --queue=long-running`) as only the default queue (i.e. no custom name) runs automatically on most setups.

### How-to: expose external webhook endpoint for widgets or buttons
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
      { 
        "name": "projects", 
        "type": "entry", 
        "default": true 
      },
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

By default, a user cannot do anything unless a role grants access!

Filters / Policies can be used for more granular control.

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
      "status": {
        "read": true,
        "write": false
      }
    }
  }
}
```

Filter example (user-bound):

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
Translations are loaded by a `resource_translations` envelope in a `.bake.json` file referencing a JSON file.

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
- `system.json`: loaders and bakery options (for example type generation). Pretty much always the same for each system.
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

## Brezel packaging and CLI
Consumer Brezel projects use the project-root `bakery` entrypoint. They are not normal Laravel application roots.

- Run framework operations as `php bakery <command>` from the project root.
- Do not run `php artisan` and do not invoke `vendor/brezel/api/artisan`. That Artisan entrypoint belongs to development of the installed API package, not to the consuming project.
- `php bakery` boots the consumer project's `bootstrap/app.php`, including registered recipe providers, and redirects Brezel paths to the consumer's `.env`, `storage/`, and `systems/` directories.
- Bakery exposes an explicit allowlist of commands, not the full Laravel Artisan command set. Do not assume commands such as `cache:clear`, `config:cache`, `test`, or arbitrary package commands are available through Bakery.
- The available commands vary by installed `brezel/api` version. Verify them in `vendor/brezel/api/app/Console/Commands/BrezelCLI.php` and inspect command-specific usage with `php bakery help <command>`.
- The command name must be the first argument after `bakery`; put options after it, for example `php bakery apply --no-interaction`.
- Use `php bakery shell` for the intentionally exposed interactive Tinker shell, including recipe-parser checks and controlled backend inspection.
- Use `php bakery work`, not `php bakery queue:work`, to start a worker in current Brezel versions.
- Use `php bakery schedule` for one scheduler pass. A local runner or production scheduler must invoke it repeatedly, in prod this is usually a 1 minute interval crontab. The schedule is the basis for `event/cron` elements.
- Project tests, linters, and frontend builds use their project-level Composer, npm, or binary commands; they are not Bakery commands.

Prefer existing project wrappers when present:
- `bin/a`, `mise run apply`, or shell alias `a`: run `php bakery apply`.
- `bin/l`, `mise run load`, or shell alias `l`: run `php bakery load`.
- `bin/u`, `mise run update`, or shell alias `u`: commonly run migration, workflow loading, and Bakery apply in the project's defined order.
- Inspect wrapper implementation before relying on it. Some wrappers are not fail-fast, so review every command's output rather than trusting only the final exit status.

## Validation and dev loop
Typical commands (project-specific wrappers may exist):
- `php bakery plan [system]` - inspect upcoming Bakery resource changes.
- `php bakery apply [system]` - apply non-workflow Bakery resources.
- `php bakery load [system]` - reload workflows.
- `php bakery migrate --force` - run central and tenant migrations when required.
- `bin/u` or `mise run update` - run the project's complete update sequence.

Recipe validation:
- There is no dedicated recipe-lint command. The backend parser can check syntax through `App\Recipes\Driver\Native\Lang\Parser::checkSyntax()` or `parseExpression()`.
- For ad-hoc checks, run `php bakery shell`, instantiate the parser, and check the exact expression, for example `(new \App\Recipes\Driver\Native\Lang\Parser)->checkSyntax('$customer ?? $defaultCustomer')`.
- Evaluate with representative data through `recipe()` when runtime behavior matters.
- Syntax validation cannot prove that a workflow `$variable`, a `this` field, or a branch-dependent value exists at runtime. Verify those against the actual element inputs, top-level `set` mappings, and workflow execution paths.
- `php bakery load` loads workflow JSON but does not comprehensively parse every inline workflow recipe.

If workflows use queues (`async: true`):
- Run workers for required queues with `php bakery work --queue=<queue_name>`. Use `php bakery work` without `--queue` for the default queue. In production, custom queues are usually started automatically through generated Supervisor configuration.

## Final validation checklist
- JSON syntax valid and file naming matches purpose.
- Bakery envelope key matches file intent (`resource_module`, `resource_entity`, etc.).
- Module/layout/reference identifiers resolve.
- New field is reflected in module + layout + translations (+ roles if needed).
- Button identifiers align with workflow event identifiers.
- Recipe syntax was checked with the backend parser where practical, and runtime context (`this` vs `$variables`) was verified from workflow inputs, top-level `set` mappings, and execution paths.
- Widgets used in layout are registered in frontend bootstrap with exact matching name.
- `depends_on` covers all needed seed dependencies.
- Changes were applied/loaded with correct bakery command (`apply` vs `load`) to test locally.
