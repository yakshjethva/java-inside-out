/** Shown in the page area while a page's code loads for the first time. */
export function PageLoading() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-24">
      <p role="status" className="text-[14px] text-fg-subtle">
        Loading…
      </p>
    </div>
  );
}
