# TODO: Implement Material Withdrawal in UserJobDetailDialog

## Current Status
- [x] Analyze code and create plan
- [x] Update Task interface in types/index.ts
- [x] Modify UserTaskUpdate.tsx to add withdrawal UI
- [x] Add material selection dialog
- [ ] Implement withdrawal logic and notifications
- [ ] Display withdrawn materials in task
- [ ] Verify leader visibility in LeaderJobDetailDialog
- [ ] Test functionality

## Notes
- Materials are stored in arrays: electricalMaterials, networkMaterials, etc.
- Withdrawal per task, displayed in task, visible to leaders.
- Use existing notification system for leader alerts.
