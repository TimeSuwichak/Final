# Chat System Fixes Plan

## Issues Identified
1. **Inconsistent Data Structures**: Two different collections ('chats' vs 'chatRooms') causing confusion
2. **Broken Unread Logic**: Missing 'read' fields and improper admin unread tracking
3. **Hardcoded User IDs**: Not using proper authentication context
4. **Poor Admin UX**: Chat list shows IDs instead of user names
5. **Duplicate Components**: Multiple chat implementations

## Fix Plan

### Phase 1: Standardize Data Structure
- [x] Remove 'chatRooms' references from ChatPage.tsx and ChatRoom.tsx
- [x] Use only 'chats' collection with 'messages' subcollection
- [x] Update routing to use consistent chat pages

### Phase 2: Fix Authentication
- [x] Replace hardcoded userId in pages/chat/index.tsx with auth context
- [x] Update FloatingChatWidget to use proper user ID
- [x] Ensure all chat components use authenticated user IDs

### Phase 3: Fix Unread Message Logic
- [x] Add 'read' field to message documents
- [x] Properly set 'hasUnreadForAdmin' in chat documents
- [x] Update useUnreadChatCount hook to work correctly
- [x] Mark messages as read when viewed

### Phase 4: Improve Admin Experience
- [x] Update AdminChatList to show user names instead of IDs
- [x] Add user information to chat documents
- [x] Improve chat list UI with last message preview

### Phase 5: Clean Up Components
- [x] Remove duplicate chat components (ChatPage.tsx, ChatRoom.tsx if not needed)
- [x] Consolidate chat functionality into UserChat and AdminChatRoom
- [x] Update router to use consistent chat routes

### Phase 6: Testing
- [ ] Test user chat functionality
- [ ] Test admin chat management
- [ ] Test unread badge updates
- [ ] Test image upload functionality

### Current Task: Fix Message Sending
- [ ] Add error handling to UserChat.tsx sendMessage
- [ ] Add error handling to AdminChatRoom.tsx sendMessage
- [ ] Ensure text trimming in AdminChatRoom.tsx
- [ ] Remove ChatPage.tsx and ChatRoom.tsx
- [ ] Update router.tsx to remove chatRooms routes
- [ ] Test message sending functionality

### Add Missing Chat Route
- [x] Import ChatPage in router.tsx
- [x] Add "/chat" route for user, leader, executive roles
- [x] Delete techjob-ts/src/pages/chat/ChatPage.tsx
- [x] Delete techjob-ts/src/pages/chat/ChatRoom.tsx
- [x] Update TODO.md to reflect completed tasks
