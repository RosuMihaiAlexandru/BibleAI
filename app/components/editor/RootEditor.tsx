'use client'

import { TiptapCollabProvider } from '@hocuspocus/provider'
import 'iframe-resizer/js/iframeResizer.contentWindow'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Doc as YDoc } from 'yjs'

import { BlockEditor } from './BlockEditor'
import { createPortal } from 'react-dom'
import { Surface } from '../../components/ui/Surface'
import { Toolbar } from '../../components/ui/Toolbar'
import { Icon } from '../../components/ui/Icon'


export default function RootEditor({ params, setRootEditor, bodyContent }: { params: { room: string }, setRootEditor: any, bodyContent: any }) {

    const [provider, setProvider] = useState<TiptapCollabProvider | null>(null)
    const [collabToken, setCollabToken] = useState<string | null | undefined>()
    const [aiToken, setAiToken] = useState<string | null | undefined>()
    const searchParams = useSearchParams()

    const hasCollab = parseInt(searchParams?.get('noCollab') as string) !== 1 && collabToken !== null

    const { room } = params

    useEffect(() => {
        // fetch data
        // const dataFetch = async () => {
        //     try {
        //         const response = await fetch('/api/collaboration', {
        //             method: 'POST',
        //             headers: {
        //                 'Content-Type': 'application/json',
        //             },
        //         })

        //         setCollabToken(null)
        //     } catch (e) {
        //         if (e instanceof Error) {
        //             console.error(e.message)
        //         }
        //         setCollabToken(null)
        //         return
        //     }
        // }

        setCollabToken(null)
    }, [])

    useEffect(() => {
        // fetch data
        const dataFetch = async () => {
            try {
                const response = await fetch('/api/ai', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

                if (!response.ok) {
                    throw new Error('No AI token provided, please set TIPTAP_AI_SECRET in your environment')
                }
                const data = await response.json()

                const { token } = data

                // set state when the data received
                setAiToken(token)
            } catch (e) {
                if (e instanceof Error) {
                    console.error(e.message)
                }
                setAiToken(null)
                return
            }
        }

        dataFetch()
    }, [])

    const ydoc = useMemo(() => new YDoc(), [])

    useLayoutEffect(() => {
        if (hasCollab && collabToken) {
            setProvider(
                new TiptapCollabProvider({
                    name: `${process.env.NEXT_PUBLIC_COLLAB_DOC_PREFIX}${room}`,
                    appId: process.env.NEXT_PUBLIC_TIPTAP_COLLAB_APP_ID ?? '',
                    token: collabToken,
                    document: ydoc,
                }),
            )
        }
    }, [setProvider, collabToken, ydoc, room, hasCollab])

    if ((hasCollab && !provider) || aiToken === undefined || collabToken === undefined) return

    // const DarkModeSwitcher = createPortal(
    //     <Surface className="flex items-center gap-1 fixed bottom-6 right-6 z-[99999] p-1">
    //         <Toolbar.Button onClick={lightMode} active={!isDarkMode}>
    //             <Icon name="Sun" />
    //         </Toolbar.Button>
    //         <Toolbar.Button onClick={darkMode} active={isDarkMode}>
    //             <Icon name="Moon" />
    //         </Toolbar.Button>
    //     </Surface>,
    //     document.body,
    // )

    return (
        <>
            {/* {DarkModeSwitcher} */}
            <BlockEditor bodyContent={bodyContent} setRootEditor={setRootEditor} aiToken={aiToken ?? undefined} hasCollab={hasCollab} ydoc={ydoc} provider={provider} />
        </>
    )
}
