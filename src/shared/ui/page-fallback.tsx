import { Spinner } from "./spinner"

function PageFallback() {
  return (
    <section className="flex min-h-svh items-center justify-center">
      <Spinner className="size-6" />
      <span className="sr-only">loading</span>
    </section>
  )
}

export { PageFallback }
