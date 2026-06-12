'use client'

import { useEffect, useState } from 'react'
import TagSelector from '@/components/ui/TagSelector'
import { setMockGroupTags, TAG_SEEDS } from '@/data/mock-data'

interface GroupTagsEditorProps {
  groupId: string
  currentTags: string[]
  onSave: () => void
}

export default function GroupTagsEditor({ groupId, currentTags, onSave }: GroupTagsEditorProps) {
  const [tags, setTags] = useState<string[]>(currentTags)
  useEffect(() => {
    setTags(currentTags)
  }, [currentTags])
  const handleToggle = (tag: string) => {
    const next = tags.includes(tag) ? tags.filter((x) => x !== tag) : [...tags, tag]
    setTags(next)
    setMockGroupTags(groupId, next)
    onSave()
  }
  return <TagSelector tags={TAG_SEEDS} selectedTags={tags} onToggle={handleToggle} ariaLabel="Group tags" />
}
