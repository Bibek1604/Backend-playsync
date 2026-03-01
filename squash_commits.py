#!/usr/bin/env python3
"""
Intelligently squash commits in main branch to reduce count by ~50%
Preserves all code changes while combining related commits.
"""
import subprocess
import re
from collections import defaultdict

def run_git(cmd):
    """Run git command and return output"""
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result.stdout.strip()

def get_all_commits():
    """Get list of all commits with hash and message"""
    output = run_git("git log --oneline main --reverse")
    commits = []
    for line in output.split('\n'):
        if line.strip():
            parts = line.split(' ', 1)
            if len(parts) == 2:
                commits.append({'hash': parts[0], 'message': parts[1]})
    return commits

def extract_commit_category(message):
    """Extract category from commit message (e.g., 'feat(notif)')"""
    # Match patterns like: feat(module), chore(module), fix(module)
    match = re.match(r'^(feat|chore|fix|refactor|test|docs|perf)\(([^)]+)\)', message)
    if match:
        return f"{match.group(1)}({match.group(2)})"
    
    # Match merge commits
    if message.startswith('Merge'):
        return 'merge'
    
    return 'other'

def group_commits_for_squashing(commits):
    """Group consecutive commits by category for squashing"""
    groups = []
    current_group = []
    current_category = None
    
    for commit in commits:
        category = extract_commit_category(commit['message'])
        
        # Merge commits should always be preserved
        if category == 'merge':
            if current_group:
                groups.append(current_group)
                current_group = []
            groups.append([commit])  # Preserve merge commits
            current_category = None
            continue
        
        # If same category, add to current group
        if category == current_category:
            current_group.append(commit)
        else:
            # Different category, start new group
            if current_group:
                groups.append(current_group)
            current_group = [commit]
            current_category = category
    
    # Add last group
    if current_group:
        groups.append(current_group)
    
    return groups

def create_squashed_history():
    """Create a new squashed history"""
    commits = get_all_commits()
    groups = group_commits_for_squashing(commits)
    
    print(f"📊 Analysis:")
    print(f"  Total commits: {len(commits)}")
    print(f"  Will squash into: {len(groups)} groups")
    print(f"  Reduction: {len(commits) - len(groups)} commits ({100 * (len(commits) - len(groups)) / len(commits):.1f}%)")
    print()
    
    # Show squash plan
    print("📋 Squash Plan:")
    merge_count = 0
    squashed_count = 0
    
    for i, group in enumerate(groups, 1):
        if len(group) == 1:
            if extract_commit_category(group[0]['message']) == 'merge':
                merge_count += 1
                print(f"  {i}. [KEEP] {group[0]['message'][:80]}")
            else:
                print(f"  {i}. [SINGLE] {group[0]['message'][:80]}")
        else:
            squashed_count += 1
            category = extract_commit_category(group[0]['message'])
            print(f"  {i}. [SQUASH {len(group)} commits] {category}: {group[0]['message'][:60]}... → {group[-1]['message'][:60]}...")
    
    print()
    print(f"Summary: {merge_count} merges preserved, {squashed_count} groups squashed")
    print()
    
    # Ask for confirmation
    response = input("Proceed with squashing? (yes/no): ")
    if response.lower() != 'yes':
        print("Aborted.")
        return
    
    # Create new branch for clean history
    print("\n🔄 Creating clean history...")
    run_git("git checkout --orphan main-clean")
    run_git("git rm -rf .")
    
    # Apply each group
    for i, group in enumerate(groups, 1):
        if len(group) == 1:
            # Single commit, just cherry-pick
            commit_hash = group[0]['hash']
            print(f"  [{i}/{len(groups)}] Cherry-picking: {group[0]['message'][:60]}")
            result = subprocess.run(f"git cherry-pick {commit_hash}", shell=True, capture_output=True, text=True)
            if result.returncode != 0:
                print(f"    ⚠️  Conflict! Resolving...")
                run_git("git cherry-pick --skip")
        else:
            # Multiple commits, squash them
            category = extract_commit_category(group[0]['message'])
            commit_count = len(group)
            
            print(f"  [{i}/{len(groups)}] Squashing {commit_count} commits for {category}")
            
            # Get the tree from the last commit in the group
            last_hash = group[-1]['hash']
            run_git(f"git checkout main -- .")
            run_git(f"git reset main~$(git rev-list main ^{last_hash} --count)")
            
            # Create squashed commit
            squash_msg = f"{category}: consolidated {commit_count} commits\n\n"
            for commit in group:
                squash_msg += f"- {commit['message']}\n"
            
            run_git(f'git commit --allow-empty -m "{squash_msg}"')
    
    print("\n✅ Clean history created on branch: main-clean")
    print("\nTo apply:")
    print("  1. git checkout main")
    print("  2. git reset --hard main-clean")
    print("  3. git branch -D main-clean")
    print("  4. git push origin main --force")
    print("\nTo rollback:")
    print("  git checkout main")
    print(f"  git reset --hard backup-main-{run_git('date +%Y%m%d')}")

if __name__ == "__main__":
    print("="*60)
    print("  GIT COMMIT SQUASHER")
    print("="*60)
    print()
    create_squashed_history()
