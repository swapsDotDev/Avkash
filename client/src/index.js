import React, { useState, useEffect } from "react"
import ReactDOM from "react-dom"
import "./index.css"
import App from "./App"
import "@radix-ui/themes/styles.css"
import { Theme } from "@radix-ui/themes"
import { dark, light } from "@clerk/themes"
import { ClerkProvider } from "@clerk/clerk-react"
// eslint-disable-next-line no-unused-vars
import i18n from "../src/components/member/setting/i18n"
import { OrganizationProvider } from "./components/OrganizationContext"

const ACCESS_KEY =
  process.env.REACT_APP_CLERK_ACCESS_KEY

const root = ReactDOM.createRoot(
  document.getElementById("root")
)

const Index = () => {
  const [darkMode, setDarkMode] = useState("")
  const [currentTheme, setCurrentTheme] =
    useState(
      localStorage.getItem("theme") ||
        (window.matchMedia &&
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches
          ? "dark"
          : "light")
    )

  useEffect(() => {
    const handleStorageChange = () => {
      const theme = localStorage.getItem("theme")
      setCurrentTheme(
        theme ||
          (window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches
            ? "dark"
            : "light")
      )
    }

    window.addEventListener(
      "storage",
      handleStorageChange
    )

    const observer = new MutationObserver(
      (mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.attributeName ===
            "data-theme"
          ) {
            const newTheme =
              document.documentElement.getAttribute(
                "data-theme"
              )
            setCurrentTheme(newTheme)
          }
        })
      }
    )

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    })

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      )
      observer.disconnect()
    }
  }, [])

  const clerkAppearance = {
    baseTheme:
      currentTheme === "dark" ? dark : light,
    variables: {
      colorPrimary:
        currentTheme === "dark"
          ? "#ffffff"
          : "#000000",
    },
    elements: {
      userButtonPopoverActionButtonIcon: {
        color:
          currentTheme === "dark"
            ? "white"
            : "black",
      },
      userButtonPopoverFooterActionButtonIcon: {
        color:
          currentTheme === "dark"
            ? "white"
            : "black",
      },
      formButtonIcon: {
        color:
          currentTheme === "dark"
            ? "white"
            : "black",
      },
      navbarButton: {
        color:
          currentTheme === "dark"
            ? "white"
            : "black",
      },
      avatarBox: {
        boxShadow: "none",
      },
      icon: {
        color:
          currentTheme === "dark"
            ? "white"
            : "black",
      },
    },
  }

  return (
    <React.StrictMode>
      <ClerkProvider
        publishableKey={ACCESS_KEY}
        appearance={clerkAppearance}
      >
        <OrganizationProvider>
          <Theme className={darkMode}>
            <App setDarkMode={setDarkMode} />
          </Theme>
        </OrganizationProvider>
      </ClerkProvider>
    </React.StrictMode>
  )
}

root.render(<Index />)
