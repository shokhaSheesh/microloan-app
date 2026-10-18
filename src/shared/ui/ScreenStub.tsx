/** Placeholder body for screens that are routed but not designed yet. */
export function ScreenStub({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-2 px-5 pt-14">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-ink-muted">Dizayn tasdiqlangach shu yerda yigʻiladi.</p>
    </div>
  )
}
