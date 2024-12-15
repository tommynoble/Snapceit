# Changelog

## [1.0.1] - 2024-12-15

### Fixed
- Fixed TypeScript warnings and improved code quality:
  - Removed unused imports in ReceiptContext.tsx (query, onSnapshot, getDocs, deleteDoc, orderBy, ReceiptItem)
  - Cleaned up test function imports (testDynamoDBConnection)
  - Removed unused React imports in UserProfileModal.tsx
  - Fixed navigation handling in DashboardLayout.tsx
  - Improved logout functionality in mobile menu and UserProfileModal
  - Unified logout behavior across the application

### Changed
- Updated UserProfileModal to use consistent logout behavior
- Improved mobile menu with proper logout button
- Streamlined authentication flow in dashboard components

### Technical Improvements
- Reduced bundle size by removing unused imports
- Improved type safety across components
- Better code organization and maintainability
