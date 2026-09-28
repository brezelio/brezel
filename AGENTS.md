# AGENTS.md

Guidance for agentic coding in Brezel projects.

## Working method

1. Inspect examples in the current system first. They reflect the installed Brezel version and local conventions.
2. Identify the target system under `systems/<system>/` and trace all affected resources before editing.
3. Consult the official handbook at https://docs.brezel.io/ when needed.
   - > The handbook is unfortunately incomplete and not consistently organized. Do not assume every supported feature is documented or every example matches the installed version.
4. When examples and documentation are insufficient or conflict, inspect the installed implementation:
   - Backend: `vendor/brezel/api`
   - Frontend: `@kibro/brezel-spa`
   - Workflow elements: `vendor/brezel/api/app/Workflow/Elements/*`
5. Preserve existing identifiers unless an explicit migration requires a new one.

For every feature, inspect the relevant module, layouts, translations, roles, menus, seeds, buttons, workflows, recipes, and widgets.

| Change | Also inspect |
|---|---|
| Field | Layouts, translations, roles, workflows |
| Module | Layouts, menu, translations, roles, seeds |
| Button | Translation, workflow event and module |
| Relation | Pre-filters, roles, workflows, child tables |

## Architectural boundary

Brezel is declarative first. Implement behavior with Brezel resources, workflows, and recipes rather than application code.

Do not add controllers, services, commands, jobs, models, middleware, generic service providers, or other application-level PHP/Laravel architecture.

Use this escalation order:

1. Use existing Brezel resources, workflows, and recipes.
2. If necessary, expose the smallest stateless, expression-oriented PHP operation as a custom backend recipe function.
3. If a recipe function is insufficient, stop and ask the developer. The capability may belong in Brezel core.

A recipe provider is the only permitted PHP integration mechanism. It must not hook project logic into the underlying Laravel application.

## Style and file conventions

### Code and JSON

- Use camelCase for variables and functions, PascalCase for classes, and UPPER_CASE for constants.
- Use 2 spaces for indentation, not tabs.
- Prefer TypeScript and `<script setup>` for Vue widgets.
- In JSON, put each key-value pair and array entry on its own line.
- Sort object keys by size: scalar and short values first, then small objects, then larger nested structures.
- Use `"` for keys and strings.
- Use actual booleans, nulls, and numbers, not string equivalents.

### Resource files

Typical system structure:

```text
systems/<system>/
  config/  menus/  roles/  workflows/  recipes/  translations/  views/
  system.json  hostnames.bake.json  topbar.bake.json
```

Common naming conventions:

- `<name>.module.bake.json`
- `<name>.entities.bake.json`
- `<name>.layout.detail.json`
- `<name>.layout.index.json`
- `<name>.layout.summary.json`
- `<name>.menu.bake.json`
- `role.<name>.bake.json`
- `<name>.workflow.json`

`*.bake.json` files use `resource_*` envelopes. Layout files are plain JSON without a Bakery envelope. Workflows use the `.workflow.json` suffix.

To find supported Bakery resource types, inspect `BakeryResourceFactory::$resources` in `vendor/brezel/api/app/Bakery/Plan/BakeryResourceFactory.php`. Each key maps to the envelope `resource_<key>`.

Bakery references and templates include:

- Another Bakery resource: `${resource_entity.role_admin}`
- Environment value: `${env('ROOT_PASSWORD', 'secret')}`
- File content: `${file('views/pdf/invoice.twig')}` or `${trimFile('recipes/example.recipe')}`

Use `file(...)` to extract large inline layouts into separate JSON files. Use `trimFile(...)` for external `.recipe` expressions.

### Workflow layout

- Do not stack workflow elements.
- Space normal left-to-right steps approximately 320 position units apart and parallel branches approximately 220 units apart vertically.
- Keep control flow flat. Avoid deep nesting of `flow/if` and `flow/each`; capture outputs with top-level `set` mappings.

## Modules, fields, and layouts

### Modules

- Every module must define `identifier`, `title`, and `icon` at the same level.
- `icon` accepts any Iconify identifier, for example `mdi:check-circle`.
- Layout paths are system-relative and omit `.json`:

```json
"layouts": {
  "detail": "config/invoices.layout.detail",
  "index": "config/invoices.layout.index",
  "summary": "config/invoices.layout.summary"
}
```

- Use `options.single_entity` for modules that represent one settings record.
- Use `options.param_scopes` for route parameter-based system scoping.
- A module button key must match the triggering workflow event identifier and module.
- Module and button options may be recipe-driven through their `recipes` object, for example `buttons.Export.recipes.display`.

### Fields

Supported field types are the keys of `Field::$types` in `vendor/brezel/api/app/Field.php`.

Choose types by data semantics:

- Boolean state: `checkbox`
- Closed finite values: `choice` with `options.values`
- Relation: `select` or `multiselect` with `options.references`
- Repeatable nested data: `list` with `options.fields`
- Fully computed value: set `recipe` on the field

A field always has `identifier` and `type`; `options` and `recipe` are optional:

```json
{
  "identifier": "total",
  "type": "currency",
  "recipe": "sum(positions[*].amount)",
  "options": {
    "default": 0,
    "rules": "nullable|numeric",
    "show_in": [
      "module.show"
    ],
    "recipes": {
      "frontend_disabled": "this.locked"
    }
  }
}
```

Frequently used options include `default`, `rules`, `references`, `show_in`, `frontend_disabled`, `hidden_from_frontend`, and `recipes`. `options.rules` is a Laravel validation-rule string.

### Field safety

- Field identifiers must be unique across the entire module, including all nested `list` fields.
- Treat changes to persisted field types as data migrations. Inspect stored data, schema, relations, layouts, workflows, and other consumers first.
- Never change a `list` field to another type under the same identifier. Add a new field and migrate or retire the old data.
- Never change a non-`list` field into a `list` under the same identifier.
- Changes involving structural or relation-backed types such as `list`, `select`, `multiselect`, `file`, uploads, or pivot-backed fields are high risk. Prefer a new identifier and an explicit migration path.
- Atomic conversions such as `text` to `number` may be safe when existing values are compatible. `incrementing` fields require extra care.
- `select` to `multiselect` is generally supported, but still verify existing data and consumers.
- If compatibility is unclear, stop and ask the developer.

Do not use `options.recipes.hidden_from_frontend` on fields nested inside a `list`; it breaks the layout. Prefer `options.recipes.frontend_disabled`.

### References and pre-filters

- Relations use `select` or `multiselect` with `options.references`.
- Pre-filter operators are `=`, `!=`, `>`, `<`, `>=`, `<=`, `IN`, `NOT IN`, `LIKE`, and `NOT LIKE`.
- A pre-filter value may come from `field`, `recipe`, or literal `value`.
- Use `if` to apply a filter conditionally.

```json
{
  "column": "project.id",
  "operator": "=",
  "recipe": "getCurrentProjectId()",
  "if": "getCurrentProjectId() != null"
}
```

### Layouts

Layouts are `tabs -> rows -> cols -> components`; column spans use a 24-column grid.

Inspect `node_modules/@kibro/brezel-spa/src/components/layout-components/index.js` for runtime-supported component `type` values, then inspect the selected `LayoutComponent*.vue` for its options. Treat `src/layout/types.ts` as helpful but not necessarily exhaustive.

- `field_group.options.fields` may contain nested arrays for inline groups.
- Visibility and behavior may be recipe-driven at tab or component level.
- `show_in` controls contexts such as `module.show`, `module.edit`, `module.create`, and `module.index`.
- For child management in a parent detail view, use a `resource_table` filtered by the parent ID. Use `recipes.fill` to prefill the parent relation during child creation.

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
    "recipes": {
      "fill": "{'customer': this}"
    }
  }
}
```

## Recipes

Recipes are expressions, not scripts. For example, use `this.status == 'approved'`, not statements or variable declarations. The list wildcard `positions[*].amount` produces an array of that nested value across all list items.

Recipes commonly appear in:

- Field `recipe` and `field.options.recipes`
- Layout, tab, and component `options.recipes`
- Module button `recipes`
- Pre-filter `recipe`
- Workflow recipe options and `op/recipe`

- `this` is the current entity in module and layout contexts.
- `$name` refers to a workflow variable.
- Keep expressions short. Use `${trimFile('recipes/name.recipe')}` for longer reusable expressions.
- Backend and frontend recipes use separate interpreters and may expose different functions.
- Available backend functions can be checked in `vendor/brezel/api/app/Recipes/Driver/Native/Interpreter/Main/MainInterpreter.php`.
- In workflow recipes, use `??` for value fallback. Do not use `||`; it returns a boolean.

### Custom recipe functions

Use custom functions only when existing workflows and recipe functions are insufficient.

Backend registration:

1. Reuse the project's recipe package/provider when present.
2. Otherwise map a project namespace to `app/` in `composer.json`, for example `"Project\\": "app/"`.
3. Add the package class under `app/Recipes/`; it must extend `App\Recipes\Driver\Native\Interpreter\Main\Library\Packages\Package`. Its public methods become recipe functions.
4. Add or reuse `app/Providers/RecipeServiceProvider.php`:

```php
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

5. Register only this provider in `bootstrap/app.php` with `$brezel->addServiceProvider(RecipeServiceProvider::class)`.

Frontend registration is separate. Implement frontend equivalents where needed and register them in the frontend bootstrap, usually `src/main.js` or `src/main.ts`:

```ts
extendRecipeProvider((provider) => {
  provider.addSymbol('project', projectRecipes)
})
```

Use `provider.addFunction()` for un-namespaced functions. Keep equivalent backend and frontend functions behaviorally aligned, and test non-trivial custom functions.

## Workflows

### Critical semantics

- `op/set` mutates its input object; it does not create workflow variables.
- For `op/set`, `in` selects the mutation target. `copy` is an optional source whose fields are copied onto input entities.
- Top-level `set` mappings create workflow variables from element outputs. For example, `"set": { "entity": "default:" }` creates `$entity` from the `default` output.
- Top-level `set` values are port selectors, not recipe expressions. Use `op/recipe` first when a computed value is required.
- `action/run` with `scope: true` creates one variable per configured `input` key in the called workflow. Inputs do not become properties of `this`, the event prototype, or `$entry`.
- Do not infer element behavior from option names; inspect `vendor/brezel/api/app/Workflow/Elements/*`.

### Integration and operation

- A module button and its webhook event must share the same identifier, and the event must reference the button's module.
- Use lifecycle events such as `event/create` for entity lifecycle behavior.
- Long-running workflows should set `async: true` and may use a custom `queue`.
- Production worker configuration is generated for custom queue identifiers used by workflows. Locally, start matching workers manually, for example `php bakery work --queue=long-running`.
- External webhook workflows should return an explicit `action/response`.
- Workflow JSON changes require `php bakery load`; `php bakery apply` alone is insufficient.

## Widgets and generated types

Create the widget component and register it in the frontend bootstrap under the exact name used by the layout:

```ts
import ProjectSummary from './components/ProjectSummary.vue'

app.component('ProjectSummary', ProjectSummary)
```

Mount it from a layout:

```json
{
  "type": "widget",
  "options": {
    "widget": "custom",
    "component": "ProjectSummary",
    "dynamic_height": true
  }
}
```

- Prefer TypeScript, `<script setup>`, and existing Ant Design Vue components.
- Use generated Brezel entity/module types from `src/types/modules` in widget code.
- Regenerate types with `php bakery apply` or the project update wrapper.
- Files in `src/types/**`, including generated `.d.ts` files, are read-only generated output and may be committed.

## Menus, translations, roles, and seeds

### Menus and translations

- Menu entries reference module identifiers.
- Submenus use object entries and may contain module entries.
- `"default": true` marks the landing entry.
- Translate a parent/submenu entry by treating its `name` as a module identifier and adding `modules.<name>.title`.
- Add translations in the same change for new or changed fields, choices, tabs, headlines, help text, summaries, widgets, and buttons.

### Roles and permissions

Access is denied unless a role grants it.

- When adding, replacing, renaming, or materially changing fields, inspect every applicable role and update field-level read/write permissions.
- Confirm that the role using the feature can access the required module and fields.
- Preserve least privilege; do not grant access to all roles by default.
- If read/write requirements are unclear, stop and ask the developer.
- Review filters and policies when ownership, scoping, or record visibility changes.

### Entities and seeds

- Seed entities normally live in `*.entities.bake.json`.
- Use `depends_on` when a resource references another resource that must exist first. Format: `<typed_key>.<identifier>`.
- `sync` keeps the runtime resource aligned with the specification.
- `detach` generally preserves later runtime changes.

## Brezel packaging and CLI

Consumer projects use the project-root `bakery` entrypoint and are not normal Laravel application roots.

- Run framework operations as `php bakery <command>` from the project root.
- Do not run `php artisan` or `vendor/brezel/api/artisan`.
- Bakery exposes an allowlisted command set, not all Artisan commands.
- Available commands depend on the installed `brezel/api` version. Check `vendor/brezel/api/app/Console/Commands/BrezelCLI.php` or run `php bakery help <command>`.
- Put the command before its options: `php bakery apply --no-interaction`.
- Use `php bakery shell` for the exposed Tinker shell and controlled backend inspection.
- Use `php bakery work`, not `php bakery queue:work`.
- `php bakery schedule` runs one scheduler pass. It is normally invoked once per minute and drives `event/cron` workflows.
- Project tests, linters, and frontend builds use project-level Composer, npm, or binary commands, not Bakery.

Common commands:

- `php bakery plan [system]`: preview Bakery resource changes.
- `php bakery apply [system]`: apply non-workflow resources and generate configured types.
- `php bakery load [system]`: load workflows.
- `php bakery migrate --force`: run central and tenant migrations when required.
- `php bakery work [--queue=<name>]`: run a queue worker.
- `php bakery shell`: open the interactive shell.
- `php bakery recipe:validate ...`: validate a raw recipe.

Prefer project wrappers such as `bin/a`, `bin/l`, `bin/u`, or matching Mise tasks when present. Inspect them before use; some are not fail-fast, so review every command's output.

### Recipe validation

Use `php bakery recipe:validate` with exactly one input source: a quoted expression, `--stdin`, or `--file=<path>`. Check `php bakery help recipe:validate` first when working against an older installed Brezel version.

- `--level=syntax`: parse syntax only.
- `--level=calls`: also validate known functions and methods without definition context.
- `--level=context --context=<module-or-workflow-json>`: validate against a module or workflow definition. Use `--context-pointer=<RFC-6901-pointer>` when the host recipe is ambiguous.
- `--format=json`: machine-readable output.

Examples:

```bash
php bakery recipe:validate --level=calls 'sum(positions[*].amount)'
php bakery recipe:validate --context=systems/example/config/users.module.bake.json 'this.enabled'
```

Exit codes are `0` for valid, `1` for an invalid recipe, and `2` for invocation, input, context, or internal failure. A valid result is not a runtime guarantee; still verify workflow inputs, top-level `set` mappings, and branch-dependent variables. `php bakery load` does not comprehensively validate every inline workflow recipe.

## Before finishing

- Validate JSON syntax, resource envelopes, identifiers, and references.
- Confirm cross-resource changes are complete.
- Handle field type migrations and role permissions intentionally.
- Verify button/workflow identifiers and workflow recipe context.
- Confirm widgets are registered and generated files were regenerated rather than edited.
- Run the required project wrapper or Bakery `apply`/`load` commands and inspect all output.
