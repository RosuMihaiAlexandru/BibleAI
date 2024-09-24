// Assuming these are your imports and existing code
import { ReactNodeViewRenderer } from '@tiptap/react'
import { mergeAttributes, Range } from '@tiptap/core'
import { NodeViewProps } from '@tiptap/core'
import { Node as ProseMirrorNode } from 'prosemirror-model'

import { ImageBlockView } from './components/ImageBlockView'
import { Image } from '../Image'

// Define the ImageBlockViewProps interface properly
interface ImageBlockViewProps extends NodeViewProps {
  node: ProseMirrorNode & {
    attrs: { src: string, width: string, align: string, alt?: string }
  };
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageBlock: {
      setImageBlock: (attributes: { src: string }) => ReturnType
      setImageBlockAt: (attributes: { src: string; pos: number | Range }) => ReturnType
      setImageBlockAlign: (align: 'left' | 'center' | 'right') => ReturnType
      setImageBlockWidth: (width: number) => ReturnType
    }
  }
}

export const ImageBlock = Image.extend({
  name: 'imageBlock',

  group: 'block',

  defining: true,

  isolating: true,

  addAttributes() {
    return {
      src: {
        default: '',
        parseHTML: element => element.getAttribute('src'),
        renderHTML: attributes => ({
          src: attributes.src,
        }),
      },
      width: {
        default: '100%',
        parseHTML: element => element.getAttribute('data-width'),
        renderHTML: attributes => ({
          'data-width': attributes.width,
        }),
      },
      align: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-align'),
        renderHTML: attributes => ({
          'data-align': attributes.align,
        }),
      },
      alt: {
        default: undefined,
        parseHTML: element => element.getAttribute('alt'),
        renderHTML: attributes => ({
          alt: attributes.alt,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[src*="tiptap.dev"]:not([src^="data:"]), img[src*="windows.net"]:not([src^="data:"])',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addCommands() {
    return {
      setImageBlock:
        attrs =>
        ({ commands }) => {
          return commands.insertContent({ type: 'imageBlock', attrs: { src: attrs.src } })
        },

      setImageBlockAt:
        attrs =>
        ({ commands }) => {
          return commands.insertContentAt(attrs.pos, { type: 'imageBlock', attrs: { src: attrs.src } })
        },

      setImageBlockAlign:
        align =>
        ({ commands }) =>
          commands.updateAttributes('imageBlock', { align }),

      setImageBlockWidth:
        width =>
        ({ commands }) =>
          commands.updateAttributes('imageBlock', { width: `${Math.max(0, Math.min(100, width))}%` }),
    }
  },

  addNodeView() {
    // Ensure your ImageBlockView component expects the correct type
    return ReactNodeViewRenderer(ImageBlockView as (props: ImageBlockViewProps) => JSX.Element)
  },
})

export default ImageBlock
