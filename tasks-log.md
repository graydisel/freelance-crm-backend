## Todo List
- [x] Extract project table into a dumb shared component (`ProjectTableComponent`).
- [x] Create generic `CrmPaginationComponent` using Angular 19 Signals.
- [x] Move pagination logic from `clients-table` into `clients.page` level.
- [x] Update `crm-search-input` shared component to share exact CSS panel architecture with `crm-dropdown` component. Update `client-filters` template and logic with new `crm-search-input` and `crm-dropdown` (for status). For `client-create-form` and `client-details` use `crm-dropdown` component for showing search results when filling `contactPerson` field. The dropdown should support + Add "[custom text]".
- [x] Fix the Bug with saving user, when closing creating window in `clients` page. When you open Create Windows, choose or add user as contact person for client, close Create Window, and open again, the user is still chosen. Make the user deselected or reset when Create Window is closed. Create `Add Project` button for adding projects on `projects` page.
- [x] Use shared drawer component in `projects` page for adding and editing projects. For creation make empty form, for editing fill the form with current data. When creating and updating on fileds `client` and `manager` use `crm-dropdown` component.
- [x] Update `create` method in `ProjectService`. Connect it with frontend.
- [x] Create `update` method in `ProjectService`. Connect it with frontend.
- [x] Check for mistakes `project-form` component and Add style for it.

## Important tasks
- #### DONE: Create Reusable Flexible CrmDropdownComponent using Content Projection (ng-content)
- #### DONE: Improve the `ProjectCardComponent` by adding a project description field with a smooth expansion effect, without breaking the CSS Grid layout on the project list page.