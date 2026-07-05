import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCommentary, createCommentary, deleteCommentary } from '../utils/api'
import {
  Bold, Italic, UnderlineIcon, Highlighter,
  AlignLeft, AlignCenter, List, ListOrdered,
  Quote, Trash2, Send, MessageSquare, ChevronDown, ChevronUp
} from 'lucide-react'

function ToolbarButton({ onClick, isActive, title, children }) {
  return (
    <button
      className={`tiptap-btn ${isActive ? 'is-active' : ''}`}
      onClick={onClick}
      title={title}
      type="button"
    >
      {children}
    </button>
  )
}

function CommentaryEntry({ entry, onDelete }) {
  const [expanded, setExpanded] = useState(true)
  return (
    <div className="commentary-entry">
      <div className="commentary-entry-header">
        <div className="commentary-entry-meta">
          <MessageSquare size={13} />
          <strong>{entry.author}</strong>
          <span className="text-muted">·</span>
          <span className="text-muted text-xs">
            {new Date(entry.created_at).toLocaleString()}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-ghost btn-sm btn-icon"
            onClick={() => setExpanded(v => !v)}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            className="btn btn-ghost btn-sm btn-icon"
            onClick={() => onDelete(entry.id)}
            title="Delete"
          >
            <Trash2 size={14} style={{ color: 'var(--red-accent)' }} />
          </button>
        </div>
      </div>
      {expanded && (
        <div
          className="commentary-content ProseMirror"
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />
      )}
    </div>
  )
}

export default function CommentaryEditor({ matchId }) {
  const [author, setAuthor] = useState('')
  const qc = useQueryClient()

  const { data: entries = [] } = useQuery({
    queryKey: ['commentary', matchId],
    queryFn: () => fetchCommentary(matchId),
    enabled: !!matchId,
  })

  const createMut = useMutation({
    mutationFn: createCommentary,
    onSuccess: () => {
      editor?.commands.clearContent()
      qc.invalidateQueries({ queryKey: ['commentary', matchId] })
    },
  })

  const deleteMut = useMutation({
    mutationFn: deleteCommentary,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['commentary', matchId] }),
  })

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Write your match commentary here...' }),
    ],
  })

  const handleSubmit = () => {
    if (!editor || editor.isEmpty) return
    createMut.mutate({
      match_id: matchId,
      author: author.trim() || 'Anonymous',
      content: editor.getHTML(),
    })
  }

  if (!editor) return null

  return (
    <div className="commentary-section">
      <div className="section-header">
        <h3 className="section-title">
          <MessageSquare size={16} style={{ color: 'var(--gold)' }} />
          Match Commentary
        </h3>
        <span className="badge badge-group">{entries.length} notes</span>
      </div>

      {/* Existing entries */}
      {entries.length > 0 && (
        <div className="commentary-list">
          {entries.map(e => (
            <CommentaryEntry key={e.id} entry={e} onDelete={id => deleteMut.mutate(id)} />
          ))}
        </div>
      )}

      {/* Editor */}
      <div className="commentary-editor-box">
        {/* Author input */}
        <div className="commentary-author-row">
          <input
            className="commentary-author-input"
            type="text"
            placeholder="Your name (optional)"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            maxLength={60}
          />
        </div>

        {/* Tiptap */}
        <div className="tiptap-wrapper">
          <div className="tiptap-toolbar">
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
              <Bold size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
              <Italic size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline">
              <UnderlineIcon size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} title="Highlight">
              <Highlighter size={14} />
            </ToolbarButton>
            <div className="tiptap-divider" />
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align left">
              <AlignLeft size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align center">
              <AlignCenter size={14} />
            </ToolbarButton>
            <div className="tiptap-divider" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet list">
              <List size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered list">
              <ListOrdered size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote">
              <Quote size={14} />
            </ToolbarButton>
          </div>
          <EditorContent editor={editor} />
        </div>

        <div className="commentary-submit-row">
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={createMut.isPending || editor.isEmpty}
          >
            <Send size={15} />
            {createMut.isPending ? 'Posting...' : 'Post Commentary'}
          </button>
        </div>
      </div>
    </div>
  )
}
