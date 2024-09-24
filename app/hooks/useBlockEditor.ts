import { useEffect, useState } from "react";
import { useEditor, useEditorState } from "@tiptap/react";
import deepEqual from "fast-deep-equal";
import type { AnyExtension, Editor } from "@tiptap/core";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { TiptapCollabProvider, WebSocketStatus } from "@hocuspocus/provider";
import type { Doc as YDoc } from "yjs";

import { ExtensionKit } from "@/app/extensions/extension-kit";
import { userColors, userNames } from "../lib/constants";
import { randomElement } from "../lib/utils";
import type { EditorUser } from "../components/editor/types";
import { initialContent } from "@/app/lib/data/initialContent";
import { Ai } from "@/app/extensions/Ai";
import { AiImage, AiWriter } from "@/app/extensions";
import useStore from "../zustand/useStore";
// import useEditorStore from '../zustand/useStore'

declare global {
  interface Window {
    editor: Editor | null;
  }
}

export const useBlockEditor = ({
  aiToken,
  ydoc,
  provider,
  bodyContent,
  userId,
  userName = "Maxi",
}: {
  aiToken?: string;
  ydoc: YDoc;
  provider?: TiptapCollabProvider | null | undefined;
  bodyContent?: any;
  userId?: string;
  userName?: string;
}) => {
  // const { body } = useEditorStore();
  const [collabState, setCollabState] = useState<WebSocketStatus>(
    provider ? WebSocketStatus.Connecting : WebSocketStatus.Disconnected
  );

  const { body, searchQuery, setSearchQuery, setBody } = useStore();
  const [isInitialized, setIsInitialized] = useState(false);

  const editor = useEditor(
    {
      immediatelyRender: true,
      shouldRerenderOnTransaction: false,
      autofocus: true,
      onCreate: (ctx) => {
        if (provider && !provider.isSynced) {
          provider.on("synced", () => {
            setTimeout(() => {
              if (ctx.editor.isEmpty && !bodyContent) {
                ctx.editor.commands.setContent(initialContent);
              } else {
                ctx.editor.commands.setContent(bodyContent);
                setBody(bodyContent);
              }
            }, 0);
          });
        } else if (ctx.editor.isEmpty && !bodyContent) {
          ctx.editor.commands.setContent(initialContent);
          ctx.editor.commands.focus("start", { scrollIntoView: true });
        } else {
          if (bodyContent) {
            ctx.editor.commands.setContent(bodyContent);
            setBody(bodyContent);
          }
        }
      },
      onUpdate: ({ editor }) => {
        const htmlContentText = getTextContentFromParagraph(editor.getHTML());
        if (!(htmlContentText === "" && body !== "")) setBody(editor.getHTML());
        setSearchQuery("");
        // Detect /word for Bible search
        const lastText = editor.getText();
        const match = lastText.match(/\\([^\\]+)\\(?!\\)/);
        if (match) {
          const query = match[1];
          setSearchQuery(query);
        }
      },
      extensions: [
        ...ExtensionKit({
          provider,
        }),
        provider
          ? Collaboration.configure({
              document: ydoc,
            })
          : undefined,
        provider
          ? CollaborationCursor.configure({
              provider,
              user: {
                name: randomElement(userNames),
                color: randomElement(userColors),
              },
            })
          : undefined,
        aiToken
          ? AiWriter.configure({
              authorId: userId,
              authorName: userName,
            })
          : undefined,
        aiToken
          ? AiImage.configure({
              authorId: userId,
              authorName: userName,
            })
          : undefined,
        aiToken
          ? Ai.configure({
              token: aiToken,
              appId: process.env.NEXT_PUBLIC_TIPTAP_AI_APP_ID,
            })
          : undefined,
      ].filter((e): e is AnyExtension => e !== undefined),
      editorProps: {
        attributes: {
          autocomplete: "off",
          autocorrect: "off",
          autocapitalize: "off",
          class: "min-h-full",
        },
      },
    },
    [ydoc, provider]
  );
  const users = useEditorState({
    editor,
    selector: (ctx): (EditorUser & { initials: string })[] => {
      if (!ctx.editor?.storage.collaborationCursor?.users) {
        return [];
      }

      return ctx.editor.storage.collaborationCursor.users.map(
        (user: EditorUser) => {
          const names = user.name?.split(" ");
          const firstName = names?.[0];
          const lastName = names?.[names.length - 1];
          const initials = `${firstName?.[0] || "?"}${lastName?.[0] || "?"}`;

          return { ...user, initials: initials.length ? initials : "?" };
        }
      );
    },
    equalityFn: deepEqual,
  });

  const getTextContentFromParagraph = (verseParagraph: string) => {
    // Create a DOM parser to handle the HTML string
    const parser = new DOMParser();
    const doc = parser.parseFromString(verseParagraph, "text/html");

    // Get the text content of <p> tags and their children (including <span> elements)
    const paragraphs = doc.querySelectorAll("p");
    let extractedText = "";

    // Iterate over each <p> element and extract its text content, including <span> elements
    paragraphs.forEach((p) => {
      extractedText += p.textContent + " ";
    });

    return extractedText.trim(); // Remove trailing space
  };

  useEffect(() => {
    provider?.on("status", (event: { status: WebSocketStatus }) => {
      setCollabState(event.status);
    });
  }, [provider]);

  window.editor = editor;

  return { editor, users, collabState };
};
