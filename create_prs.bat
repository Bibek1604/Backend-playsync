@echo off
echo ========================================
echo Creating Pull Requests on GitHub
echo ========================================
echo.
echo This will open 8 PR creation pages in your browser.
echo Each page will have the correct base (development) and compare branches.
echo.
pause

echo.
echo Opening PR #1: Testing Infrastructure...
start "" "https://github.com/Bibek1604/Backend-playsync/compare/development...feature/testing-infrastructure-complete?expand=1&title=feat:%20Testing%20Infrastructure%20-%20Complete%20Setup&body=%23%23%20%F0%9F%A7%AA%20Testing%20Infrastructure%20Complete%0A%0A%23%23%23%20Changes%20Included:%0A-%20%E2%9C%85%20Configure%20Jest%20with%20TypeScript%20support%0A-%20%E2%9C%85%20Add%20test%20scripts%20(test,%20test:watch,%20test:coverage)%0A-%20%E2%9C%85%20Install%20testing%20dependencies%20(ts-jest,%20@types/jest)%0A-%20%E2%9C%85%20Set%20up%20code%20coverage%20thresholds%0A%0A**Commits:**%2010%20%7C%20**Impact:**%20Foundation%20for%20code%20quality"
timeout /t 2 >nul

echo Opening PR #2: Auth Security...
start "" "https://github.com/Bibek1604/Backend-playsync/compare/development...feature/auth-security-complete?expand=1&title=feat:%20Authentication%20%26%20Security%20Enhancements&body=%23%23%20%F0%9F%94%90%20Auth%20Security%20Complete%0A%0A%23%23%23%20Changes:%0A-%20Enhanced%20User%20schema%20with%20security%20fields%0A-%20Account%20lockout%20%26%20email%20verification%0A-%20Optimized%20rate%20limiting%0A-%20Restructured%20auth%20routes%0A%0A**Commits:**%2010%20%7C%20**Impact:**%20Enhanced%20security"
timeout /t 2 >nul

echo Opening PR #3: Game Core Module...
start "" "https://github.com/Bibek1604/Backend-playsync/compare/development...feature/game-core-module-complete?expand=1&title=feat:%20Game%20Core%20Module%20-%20Complete%20Implementation&body=%23%23%20%F0%9F%8E%AE%20Game%20Core%20Module%0A%0A%23%23%23%20Changes:%0A-%20Complete%20CRUD%20operations%0A-%20DTOs%20with%20validation%0A-%20Repository%20layer%20with%20MongoDB%0A-%20Cloudinary%20integration%0A-%20Type%20definitions%0A%0A**Commits:**%2010%20%7C%20**Impact:**%20Core%20game%20functionality"
timeout /t 2 >nul

echo Opening PR #4: Game Advanced Systems...
start "" "https://github.com/Bibek1604/Backend-playsync/compare/development...feature/game-advanced-systems?expand=1&title=feat:%20Game%20Advanced%20Features%20%26%20Systems&body=%23%23%20%E2%9A%A1%20Game%20Advanced%20Systems%0A%0A%23%23%23%20Changes:%0A-%20Atomic%20capacity%20manager%0A-%20Game%20lifecycle%20FSM%0A-%20Permission%20system%0A-%20Scoring%20service%0A-%20Stats%20aggregator%0A-%20Advanced%20search%0A%0A**Commits:**%2010%20%7C%20**Impact:**%20Advanced%20features"
timeout /t 2 >nul

echo Opening PR #5: Game Invitation System...
start "" "https://github.com/Bibek1604/Backend-playsync/compare/development...feature/game-invitation-system?expand=1&title=feat:%20Game%20Invitation%20%26%20Invite%20Links&body=%23%23%20%F0%9F%93%A8%20Invitation%20System%0A%0A%23%23%23%20Changes:%0A-%20Game%20invitation%20model%20with%20TTL%0A-%20Invite%20link%20CRUD%0A-%20Usage%20tracking%0A-%20Security%20tokens%0A%0A**Commits:**%2010%20%7C%20**Impact:**%20Player%20invitations"
timeout /t 2 >nul

echo Opening PR #6: User Management...
start "" "https://github.com/Bibek1604/Backend-playsync/compare/development...feature/user-management-complete?expand=1&title=feat:%20Complete%20User%20Management%20System&body=%23%23%20%F0%9F%91%A4%20User%20Management%0A%0A%23%23%23%20Changes:%0A-%20User%20CRUD%20controller%20%26%20service%0A-%20Enhanced%20routes%0A-%20Profile%20management%0A-%20User%20preferences%0A%0A**Commits:**%2010%20%7C%20**Impact:**%20Complete%20user%20operations"
timeout /t 2 >nul

echo Opening PR #7: Scorecard Optimization...
start "" "https://github.com/Bibek1604/Backend-playsync/compare/development...feature/scorecard-optimization?expand=1&title=refactor:%20Scorecard%20Module%20Optimization&body=%23%23%20%F0%9F%93%8A%20Scorecard%20Optimization%0A%0A%23%23%23%20Changes:%0A-%20Removed%20421%20lines%20of%20redundant%20code%0A-%20Optimized%20MongoDB%20aggregations%0A-%20New%20controller%20endpoints%0A-%20Service%20layer%20extraction%0A%0A**Commits:**%2010%20%7C%20**Impact:**%20Performance%20improvement"
timeout /t 2 >nul

echo Opening PR #8: Code Quality...
start "" "https://github.com/Bibek1604/Backend-playsync/compare/development...chore/code-quality-complete?expand=1&title=chore:%20Code%20Quality%20%26%20Standards&body=%23%23%20%E2%9C%A8%20Code%20Quality%0A%0A%23%23%23%20Changes:%0A-%20Enhanced%20DTO%20validation%0A-%20App%20configuration%20restructuring%0A-%20Optimized%20services%0A-%20Better%20error%20handling%0A%0A**Commits:**%2010%20%7C%20**Impact:**%20Code%20quality"
timeout /t 2 >nul

echo.
echo ========================================
echo All PR creation pages opened!
echo ========================================
echo.
echo What to do next:
echo 1. Review each PR in your browser
echo 2. Verify the base branch is "development"
echo 3. Click "Create pull request" for each one
echo 4. After all 8 PRs are merged, create final PR: development -^> main
echo.
pause
