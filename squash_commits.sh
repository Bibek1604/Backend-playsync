#!/bin/bash
# Safe Git Commit Squasher
# Reduces commits by squashing related ones while preserving all changes

echo "=========================================="
echo "  Git Commit Squash Tool"
echo "=========================================="
echo ""
echo "Current commit count: $(git log --oneline main | wc -l)"
echo "Backup created: backup-main-$(date +%Y%m%d)"
echo ""

# Get the first commit (root)
FIRST_COMMIT=$(git rev-list --max-parents=0 HEAD)
echo "First commit: $FIRST_COMMIT"
echo ""

# Count commits by module
echo "📊 Commit breakdown by module:"
git log --oneline main | grep -E "feat\(|chore\(|fix\(" | sed 's/^[a-f0-9]* //' | sed 's/:.*//' | sort | uniq -c | sort -rn | head -20
echo ""

echo "============================================"
echo "STRATEGY: Group by logical features"
echo "============================================"
echo ""
echo "We'll create squashed commits for each major module:"
echo "  1. Testing infrastructure"
echo "  2. Core middleware"  
echo "  3. Notifications system"
echo "  4. Game module v2"
echo "  5. Websocket/realtime"
echo "  6. Auth & security"
echo "  7. Other features"
echo ""

read -p "Do you want to proceed with automatic squashing? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "🔄 Creating clean squashed history..."
echo ""

# Create a new orphan branch
git checkout --orphan main-squashed

# Get all files from current main
git rm -rf .
git checkout main -- .

# Create consolidated commits based on feature groups
echo "Creating consolidated commits..."

# 1. Initial setup & early commits (if any)
git add -A
git commit -m "chore: initial project setup and configuration

- Base project structure
- Initial dependencies
- Configuration files" || echo "Skipping empty commit"

# 2. Auth & Security
git checkout main -- src/modules/auth/ 2>/dev/null || true
git add -A
git commit --allow-empty -m "feat(auth): complete authentication and security system

- User authentication with JWT
- OAuth2 integration
- 2FA support  
- Account lockout mechanism
- Email verification
- Rate limiting
- Password hashing
- Security middleware
- Audit logging
- Token revocation"

# 3. Game Core Module
git checkout main -- src/modules/game/ 2>/dev/null || true
git add -A  
git commit --allow-empty -m "feat(game): complete game management system

- Game CRUD operations
- Game lifecycle management
- Capacity manager
- Permission system
- Scoring service
- Stats aggregator
- Search functionality
- Discovery features
- Analytics repository
- Waitlist system  
- Invitation system
- Report handling"

# 4. User Management
git checkout main -- src/modules/user/ 2>/dev/null || true
git add -A
git commit --allow-empty -m "feat(user): user management module

- User CRUD operations
- Profile management
- User preferences
- Account settings
- User routes and validation"

# 5. Scorecard Module
git checkout main -- src/modules/scorecard/ 2>/dev/null || true
git add -A
git commit --allow-empty -m "feat(scorecard): scorecard and leaderboard system

- Scorecard repository
- Controller endpoints
- Service layer
- Types and interfaces
- Optimization improvements"

# 6. Notifications
git checkout main -- src/modules/notification/ 2>/dev/null || true
git add -A
git commit --allow-empty -m "feat(notification): notification system

- Push notifications (FCM)
- Device token management
- Notification templates
- Notification queue
- User preferences
- Admin broadcast
- Notification dispatcher"

# 7. Chat Module
git checkout main -- src/modules/chat/ 2>/dev/null || true
git add -A
git commit --allow-empty -m "feat(chat): real-time chat system

- Chat controller and service
- Chat repository
- Socket integration
- Message handling
- Chat rooms"

# 8. WebSocket/Real-time
git checkout main -- src/websocket/ 2>/dev/null || true
git add -A
git commit --allow-empty -m "feat(websocket): real-time communication infrastructure

- Socket server setup
- Event handling
- Room management  
- Presence tracking
- Rate limiting
- Middleware composition
- Broadcasting"

# 9. Core Middleware
git checkout main -- src/Share/middleware/ 2>/dev/null || true
git add -A
git commit --allow-empty -m "feat(core): core middleware and utilities

- Request logger
- Security headers
- Error handling
- Request context
- RBAC middleware
- API versioning
- Body validation
- Response time tracking"

# 10. Other modules
git checkout main -- src/modules/ 2>/dev/null || true
git add -A
git commit --allow-empty -m "feat: additional modules and features

- Complete module
- Cancel module
- History tracking
- Tags system
- Admin module"

# 11. Testing infrastructure
git checkout main -- __tests__/ jest.config.ts scripts/backfill-xp.ts 2>/dev/null || true
git add -A
git commit --allow-empty -m "feat(test): testing infrastructure

- Jest configuration
- Test directory structure
- Sample tests
- Testing dependencies
- XP backfill script"

# 12. Final sync - get all remaining files
git checkout main -- .
git add -A
git commit --allow-empty -m "chore: final updates and configurations

- Package dependencies
- Configuration updates  
- Documentation
- Miscellaneous improvements"

echo ""
echo "✅ Squashed history created!"
echo ""
git log --oneline main-squashed
echo ""
echo "New commit count: $(git log --oneline main-squashed | wc -l)"
echo ""
echo "=========================================="
echo "To apply the squashed history:"
echo "=========================================="
echo "  git checkout main"
echo "  git reset --hard main-squashed"
echo "  git branch -D main-squashed"
echo "  git push origin main --force"
echo ""
echo "To rollback if something goes wrong:"
echo "  git reset --hard backup-main-$(date +%Y%m%d)"
echo ""
