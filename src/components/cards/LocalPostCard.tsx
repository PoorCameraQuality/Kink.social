'use client'

import { useId, useState, useEffect } from 'react'
import Link from 'next/link'
import TrustRing from '@/components/TrustRing'
import PlaceholderAvatar from '@/components/PlaceholderAvatar'

export type LocalPostCardProps = {
  post: {
    id: string
    authorUsername: string
    authorTrustScore: number
    text: string
    timeAgo: string
    likes: number
    comments: number
  }
  isOwnPost?: boolean
  onEdit?: (text: string) => void
  onDelete?: () => void
}

export default function LocalPostCard({ post, isOwnPost, onEdit, onDelete }: LocalPostCardProps) {
  const editFieldId = useId()
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(post.text)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [localLikes, setLocalLikes] = useState(likes)
  const { authorUsername, authorTrustScore, text, timeAgo, likes: seedLikes, comments } = post

  useEffect(() => {
    setLocalLikes(seedLikes)
  }, [post.id, seedLikes])

  const handleSaveEdit = () => {
    if (editText.trim() && onEdit) {
      onEdit(editText.trim())
      setIsEditing(false)
    }
  }

  const handleDelete = () => {
    if (deleteConfirm && onDelete) {
      onDelete()
      setDeleteConfirm(false)
    } else {
      setDeleteConfirm(true)
      setTimeout(() => setDeleteConfirm(false), 3000)
    }
  }

  return (
    <article className="bg-c2k-bg-card rounded-2xl border border-white/10 p-4 shadow-c2k-soft">
      <div className="flex gap-3">
        <Link href={`/profile/${authorUsername}`} className="flex-shrink-0">
          <TrustRing score={authorTrustScore} size="sm" showBreakdown={false} className="rounded-full">
            <PlaceholderAvatar size="sm" className="!rounded-full" />
          </TrustRing>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/profile/${authorUsername}`} className="font-medium text-white hover:text-c2k-accent-primary truncate">
              {authorUsername}
            </Link>
            <span className="text-c2k-text-muted text-sm flex-shrink-0 ml-auto">{timeAgo}</span>
            {isOwnPost && onEdit && onDelete && (
              <div className="flex gap-1 ml-auto">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="min-h-11 min-w-[44px] px-2 text-xs font-medium text-c2k-accent-primary hover:underline"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false)
                        setEditText(text)
                      }}
                      className="min-h-11 min-w-[44px] px-2 text-xs font-medium text-c2k-text-muted hover:text-white"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(true)
                        setEditText(text)
                      }}
                      className="min-h-11 min-w-[44px] px-2 text-xs font-medium text-c2k-text-muted hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className={`min-h-11 min-w-[44px] px-2 text-xs font-medium ${
                        deleteConfirm ? 'text-c2k-danger' : 'text-c2k-text-muted hover:text-c2k-danger'
                      }`}
                      aria-label={deleteConfirm ? 'Confirm delete post' : 'Delete post'}
                    >
                      {deleteConfirm ? 'Confirm delete?' : 'Delete'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          {isEditing && onEdit ? (
            <>
              <label htmlFor={editFieldId} className="sr-only">
                Edit post text
              </label>
              <textarea
                id={editFieldId}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="mt-2 w-full px-3 py-2 bg-c2k-bg border border-white/10 rounded-lg text-white text-sm resize-none"
                rows={3}
              />
            </>
          ) : (
            <p className="mt-2 text-c2k-text-secondary text-sm leading-relaxed">{text}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Post actions">
            <button
              type="button"
              onClick={() => setLocalLikes((n) => n + 1)}
              className="inline-flex min-h-11 min-w-[44px] items-center justify-center rounded-lg px-3 text-sm text-c2k-text-muted transition-colors hover:text-c2k-accent-primary"
              aria-label={`Love post (${localLikes} likes)`}
              title="Demo: like count updates locally only"
            >
              Love {localLikes}
            </button>
            <button
              type="button"
              disabled
              className="inline-flex min-h-11 min-w-[44px] items-center justify-center rounded-lg px-3 text-sm text-c2k-text-muted/50 cursor-not-allowed"
              aria-label={`Comment (${comments} comments)`}
              title="Comments are not wired in the demo yet"
            >
              Comment {comments}
            </button>
            <button
              type="button"
              disabled
              className="inline-flex min-h-11 min-w-[44px] items-center justify-center rounded-lg px-3 text-sm text-c2k-text-muted/50 cursor-not-allowed"
              aria-label="Share post"
              title="Share is not wired in the demo yet"
            >
              Share
            </button>
            <button
              type="button"
              disabled
              className="inline-flex min-h-11 min-w-[44px] items-center justify-center rounded-lg px-3 text-sm text-c2k-text-muted/50 cursor-not-allowed"
              aria-label="Bookmark post"
              title="Bookmarks are not wired in the demo yet"
            >
              Bookmark
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
