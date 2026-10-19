import { useEffect, useState } from "react"

export type Route = "editor" | "about"

const routeFromHash = (): Route => (window.location.hash === "#/about" ? "about" : "editor")

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(routeFromHash)
  useEffect(() => {
    const onChange = () => {
      setRoute(routeFromHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener("hashchange", onChange)
    return () => window.removeEventListener("hashchange", onChange)
  }, [])
  return route
}
