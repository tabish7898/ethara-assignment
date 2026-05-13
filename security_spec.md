# ProFlow Security Specification

## Data Invariants
1. A Task must belong to a valid Project.
2. Only Project Members can view or modify Project data (Tasks, Members, Activity).
3. Only Project Admins can edit Project settings or manage Members.
4. Global Admins have full access to everything.
5. `ownerId` and `projectId` are immutable.
6. Timestamps (`createdAt`, `updatedAt`, `joinedAt`) must be server-generated.

## The Dirty Dozen Payloads (Target: DENIED)
1. Creating a task with a project ID that doesn't exist.
2. Non-member trying to read project tasks.
3. Member trying to delete a project.
4. Member trying to add another member to a project.
5. User trying to change their own role to ADMIN in `/users/{userId}`.
6. User trying to edit another user's profile.
7. Creating a task with a 1MB title string (Resource Poisoning).
8. Updating a project's `ownerId`.
9. Task update skipping `updatedAt` server timestamp.
10. Joining a project with a role not in the enum.
11. Querying all tasks across all projects without a filter (Blanket Read).
12. Deleting an admin user from `/users` by a non-admin.

## Access Patterns
- `users`: Read by all (for member search), Write only by owner (limited) or Global Admin.
- `projects`: Read by members, Create by authenticated, Edit by Project Admin or Global Admin.
- `tasks`: Read/Write by project members.
- `members`: Read by project members, Write by Project Admin.
