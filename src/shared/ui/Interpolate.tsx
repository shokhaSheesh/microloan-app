import { Fragment, type ReactNode } from 'react'

type Props = {
  /** A translated sentence with {name} slots, e.g. "{terms} va {privacy} bilan tanishdim". */
  text: string
  /** What goes into each slot, e.g. a link. */
  parts: Record<string, ReactNode>
}

/** Renders a translated sentence with elements in its slots, so word order stays per language. */
export function Interpolate({ text, parts }: Props) {
  return (
    <>
      {text.split(/(\{\w+\})/).map((piece, i) => {
        const name = piece.match(/^\{(\w+)\}$/)?.[1]
        return <Fragment key={i}>{name && name in parts ? parts[name] : piece}</Fragment>
      })}
    </>
  )
}
