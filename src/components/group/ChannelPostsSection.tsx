'use client'

import Link from 'next/link'
import Card from '@/components/ui/Card'
import {
  deleteMockGroupPost,
  editMockGroupPost,
  getMockPostsForChannel,
  togglePinMockGroupPost,
} from '@/data/mock-data'
import type { MockGroupPost } from '@/data/mock-data'
import { useViewerUsername } from '@/contexts/AuthContext'

interface ChannelPostsSectionProps {
  channelId: string
  canModerate: boolean
  editingPostId: string | null
  editingPostTitle: string
  editingPostContent: string
  setEditingPostId: (id: string | null) => void
  setEditingPostTitle: (value: string) => void
  setEditingPostContent: (value: string) => void
  onRefresh: () => void
}

function PostCard({
  viewerUsername,
  post,
  showPin,
  canModerate,
  isEditing,
  editingTitle,
  editingContent,
  setEditingTitle,
  setEditingContent,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onTogglePin,
}: {
  viewerUsername: string
  post: MockGroupPost
  showPin: boolean
  canModerate: boolean
  isEditing: boolean
  editingTitle: string
  editingContent: string
  setEditingTitle: (value: string) => void
  setEditingContent: (value: string) => void
  onEdit: () => void
  onCancelEdit: () => void
  onSave: () => void
  onDelete: () => void
  onTogglePin: () => void
}) {
  const isOwn = !!viewerUsername && post.authorUsername === viewerUsername
  return (
    <li>
      <Card className="p-4 flex gap-3">
      {showPin && <span className="text-c2k-accent-primary">📌</span>}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="space-y-2">
            <input
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              className="w-full px-2 py-1 bg-c2k-bg border border-white/10 rounded text-sm text-white"
              placeholder="Title"
            />
            <textarea
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              className="w-full px-2 py-1 bg-c2k-bg border border-white/10 rounded text-sm text-white resize-none"
              rows={2}
              placeholder="Content"
            />
            <div className="flex gap-2">
              <button type="button" onClick={onSave} className="text-xs text-c2k-accent-primary">
                Save
              </button>
              <button type="button" onClick={onCancelEdit} className="text-xs text-c2k-text-muted">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <Link href="#" className="font-medium text-white hover:text-c2k-accent-primary">
              {post.title}
            </Link>
            <p className="text-sm text-c2k-text-muted mt-0.5">{post.content}</p>
            <p className="text-xs text-c2k-text-muted mt-1">
              {post.createdAt} by {post.authorUsername}
            </p>
          </>
        )}
        {!isEditing && (
          <div className="flex gap-2 mt-2">
            {isOwn && (
              <>
                <button type="button" onClick={onEdit} className="text-xs text-c2k-text-muted hover:text-white">
                  Edit
                </button>
                <button type="button" onClick={onDelete} className="text-xs text-c2k-danger hover:text-c2k-danger/90">
                  Delete
                </button>
              </>
            )}
            {canModerate && (
              <>
                <button type="button" onClick={onTogglePin} className="text-xs text-c2k-text-muted hover:text-white">
                  {post.isPinned ? 'Unpin' : 'Pin'}
                </button>
                {!isOwn && (
                  <button type="button" onClick={onDelete} className="text-xs text-c2k-danger hover:text-c2k-danger/90">
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
      </Card>
    </li>
  )
}

export default function ChannelPostsSection({
  channelId,
  canModerate,
  editingPostId,
  editingPostTitle,
  editingPostContent,
  setEditingPostId,
  setEditingPostTitle,
  setEditingPostContent,
  onRefresh,
}: ChannelPostsSectionProps) {
  const viewerUsername = useViewerUsername()
  const posts = getMockPostsForChannel(channelId)
  const pinned = posts.filter((p) => p.isPinned)
  const discussions = posts.filter((p) => !p.isPinned)

  const handleSave = (post: MockGroupPost) => {
    editMockGroupPost(post.id, { title: editingPostTitle, content: editingPostContent })
    setEditingPostId(null)
    onRefresh()
  }

  return (
    <div className="space-y-6">
      {pinned.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-c2k-text-muted uppercase mb-3">Pinned</h3>
          <ul className="space-y-2">
            {pinned.map((post) => (
              <PostCard
                key={post.id}
                viewerUsername={viewerUsername}
                post={post}
                showPin
                canModerate={canModerate}
                isEditing={editingPostId === post.id}
                editingTitle={editingPostTitle}
                editingContent={editingPostContent}
                setEditingTitle={setEditingPostTitle}
                setEditingContent={setEditingPostContent}
                onEdit={() => {
                  setEditingPostId(post.id)
                  setEditingPostTitle(post.title)
                  setEditingPostContent(post.content)
                }}
                onCancelEdit={() => setEditingPostId(null)}
                onSave={() => handleSave(post)}
                onDelete={() => {
                  deleteMockGroupPost(post.id)
                  onRefresh()
                }}
                onTogglePin={() => {
                  togglePinMockGroupPost(post.id)
                  onRefresh()
                }}
              />
            ))}
          </ul>
        </div>
      )}
      <div>
        <h3 className="text-sm font-semibold text-c2k-text-muted uppercase mb-3">Discussions</h3>
        {discussions.length > 0 ? (
          <ul className="space-y-2">
            {discussions.map((post) => (
              <PostCard
                key={post.id}
                viewerUsername={viewerUsername}
                post={post}
                showPin={false}
                canModerate={canModerate}
                isEditing={editingPostId === post.id}
                editingTitle={editingPostTitle}
                editingContent={editingPostContent}
                setEditingTitle={setEditingPostTitle}
                setEditingContent={setEditingPostContent}
                onEdit={() => {
                  setEditingPostId(post.id)
                  setEditingPostTitle(post.title)
                  setEditingPostContent(post.content)
                }}
                onCancelEdit={() => setEditingPostId(null)}
                onSave={() => handleSave(post)}
                onDelete={() => {
                  deleteMockGroupPost(post.id)
                  onRefresh()
                }}
                onTogglePin={() => {
                  togglePinMockGroupPost(post.id)
                  onRefresh()
                }}
              />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-c2k-text-muted">No discussions yet.</p>
        )}
      </div>
    </div>
  )
}
