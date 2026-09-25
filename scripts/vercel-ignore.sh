#!/usr/bin/env bash
# Vercel Ignored Build Step: exit 0 = hoppa över bygget, exit 1 = bygg.
# Alla andra exitkoder blir ERROR i Vercel. Scriptet får aldrig avsluta med något annat.
# Osäkert läge (saknad SHA, git-fel) = bygg.
set -u
prev="${VERCEL_GIT_PREVIOUS_SHA:-}"
if [ -z "$prev" ]; then
  echo "vercel-ignore: ingen tidigare SHA, bygger."
  exit 1
fi
if ! git cat-file -e "${prev}^{commit}" 2>/dev/null; then
  if ! git fetch --quiet --depth=1 origin "$prev" 2>/dev/null; then
    echo "vercel-ignore: $prev saknas i klonen och gick inte att hämta, bygger."
    exit 1
  fi
fi
if git diff --quiet "$prev" HEAD -- . ':(exclude)**/*.md' ':(exclude)docs/**' ':(exclude).claude/**' 2>/dev/null; then
  echo "vercel-ignore: bara dokumentation ändrad sedan $prev, hoppar över bygget."
  exit 0
fi
echo "vercel-ignore: kod eller data ändrad sedan $prev, bygger."
exit 1
