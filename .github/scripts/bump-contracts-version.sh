#!/usr/bin/env bash
set -euo pipefail

CRM_PACKAGE_JSON_PATH="${1:-api/src/contracts/crm/package.json}"
PUBLIC_PACKAGE_JSON_PATH="${2:-api/src/contracts/public/package.json}"
TAG_PREFIX="${3:-contracts-}"

if [[ ! -f "$CRM_PACKAGE_JSON_PATH" ]]; then
  echo "CRM package.json not found: $CRM_PACKAGE_JSON_PATH"
  exit 1
fi

if [[ ! -f "$PUBLIC_PACKAGE_JSON_PATH" ]]; then
  echo "Public package.json not found: $PUBLIC_PACKAGE_JSON_PATH"
  exit 1
fi

crm_version=$(node -p "require('./$CRM_PACKAGE_JSON_PATH').version")
public_version=$(node -p "require('./$PUBLIC_PACKAGE_JSON_PATH').version")

if [[ "$crm_version" != "$public_version" ]]; then
  echo "Contracts versions are different (crm=$crm_version, public=$public_version). Align them first."
  exit 1
fi

IFS='.' read -r major minor patch <<< "$crm_version"

commit_msg=$(git log -1 --pretty=%B | tr '\n' ' ')

if echo "$commit_msg" | grep -qEi 'feat:|from .*/feat/'; then
  minor=$((minor + 1))
  patch=0
elif echo "$commit_msg" | grep -qEi 'fix:|from .*/fix/'; then
  patch=$((patch + 1))
else
  patch=$((patch + 1))
fi

new_version="$major.$minor.$patch"

echo "New contracts version: $new_version"

node -e "
const fs = require('fs');
const crmPath = '$CRM_PACKAGE_JSON_PATH';
const publicPath = '$PUBLIC_PACKAGE_JSON_PATH';
const nextVersion = '$new_version';

const crmPkg = require('./' + crmPath);
const publicPkg = require('./' + publicPath);

crmPkg.version = nextVersion;
publicPkg.version = nextVersion;

fs.writeFileSync(crmPath, JSON.stringify(crmPkg, null, 2) + '\\n');
fs.writeFileSync(publicPath, JSON.stringify(publicPkg, null, 2) + '\\n');
"

git config user.name "github-actions"
git config user.email "github-actions@github.com"
git add "$CRM_PACKAGE_JSON_PATH" "$PUBLIC_PACKAGE_JSON_PATH"
git commit -m "chore: bump contracts version to $new_version"

if [[ -n "$TAG_PREFIX" ]]; then
  tag_name="${TAG_PREFIX}v${new_version}"
  git tag "$tag_name"
  git push origin "$tag_name"
fi

git push origin HEAD:main

echo "NEW_VERSION=$new_version" >> "$GITHUB_ENV"
