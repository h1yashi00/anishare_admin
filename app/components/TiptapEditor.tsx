import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { useEffect } from 'react'

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  editable?: boolean
  className?: string
}

export default function TiptapEditor({ 
  content, 
  onChange, 
  placeholder = "テキストを入力してください...",
  editable = true,
  className = ""
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
    ],
    content: content,
    editable: editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none ${className}`,
        placeholder: placeholder,
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  return (
    <div className="border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
      {editable && (
        <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-100 ${
              editor.isActive('bold') ? 'bg-gray-200' : ''
            }`}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-100 ${
              editor.isActive('italic') ? 'bg-gray-200' : ''
            }`}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-100 ${
              editor.isActive('strike') ? 'bg-gray-200' : ''
            }`}
          >
            <s>S</s>
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-100 ${
              editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''
            }`}
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-100 ${
              editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''
            }`}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-100 ${
              editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''
            }`}
          >
            H3
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-100 ${
              editor.isActive('bulletList') ? 'bg-gray-200' : ''
            }`}
          >
            • リスト
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-100 ${
              editor.isActive('orderedList') ? 'bg-gray-200' : ''
            }`}
          >
            1. リスト
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-100 ${
              editor.isActive('blockquote') ? 'bg-gray-200' : ''
            }`}
          >
            " 引用
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="px-2 py-1 text-sm rounded hover:bg-gray-100"
          >
            ―
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <button
            type="button"
            onClick={() => {
              const url = window.prompt('URLを入力してください:')
              if (url) {
                editor.chain().focus().setLink({ href: url }).run()
              }
            }}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-100 ${
              editor.isActive('link') ? 'bg-gray-200' : ''
            }`}
          >
            🔗 リンク
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive('link')}
            className="px-2 py-1 text-sm rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            リンク削除
          </button>
        </div>
      )}
      <div className="p-3 min-h-[120px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
