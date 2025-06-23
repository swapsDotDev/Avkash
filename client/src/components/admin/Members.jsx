import React, { useEffect, useState } from "react"
import { Grid } from "@radix-ui/themes"
import { OrganizationProfile } from "@clerk/clerk-react"
import { dark, light } from "@clerk/themes"

const Members = () => {
  const [currentTheme, setCurrentTheme] =
    useState(
      document.documentElement.getAttribute(
        "data-theme"
      ) ||
        localStorage.getItem("theme") ||
        (window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches
          ? "dark"
          : "light")
    )

  useEffect(() => {
    const handleStorageChange = () => {
      const theme = localStorage.getItem("theme")
      if (theme) {
        setCurrentTheme(theme)
      }
    }

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

    window.addEventListener(
      "storage",
      handleStorageChange
    )

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      )
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    let styleElement = document.getElementById(
      "clerk-custom-styles"
    )
    if (!styleElement) {
      styleElement =
        document.createElement("style")
      styleElement.id = "clerk-custom-styles"
      document.head.appendChild(styleElement)
    }

    styleElement.innerHTML =
      currentTheme === "dark"
        ? `
        .cl-tabButton, .cl-tabButton[class*='cl-internal'], button[class*='cl-internal'] {
          color: #ffffff !important;
        }
        .cl-tabButton *, .cl-tabButton[class*='cl-internal'] *, button[class*='cl-internal'] * {
          color: #ffffff !important;
        }
        .cl-membersPageInviteButton, button[class*='cl-membersPageInviteButton'] {
          color: #ffffff !important;
          background-color: #3e63dd !important;
        }
        .cl-membersPageInviteButton svg, button[class*='cl-membersPageInviteButton'] svg {
          color: #ffffff !important;
        }
        .cl-membersPageInviteButton path, button[class*='cl-membersPageInviteButton'] path {
          fill: #ffffff !important;
        }
        .cl-formButtonReset {
          background-color:rgb(27, 95, 158) !important;
        }
        .cl-formButtonPrimary {
          background-color: #3e63dd !important;
        } 
        .cl-formButtonPrimary, button[class*='cl-formButtonPrimary'], button[class*='cl-internal-g2dmbx'] {
        color: #ffffff !important;
        }
        .cl-formButtonPrimary *, button[class*='cl-formButtonPrimary'] *, button[class*='cl-internal-g2dmbx'] * {
        color: #ffffff !important;
    }
      `
        : `
        .cl-tabButton, .cl-tabButton[class*='cl-internal'], button[class*='cl-internal'] {
          color: #2d3748 !important;
        }
        .cl-tabButton *, .cl-tabButton[class*='cl-internal'] *, button[class*='cl-internal'] * {
          color: #2d3748 !important;
        }
        .cl-membersPageInviteButton, button[class*='cl-membersPageInviteButton'] {
          color: #ffffff !important;
          background-color: #3e63dd !important;
        }
        .cl-membersPageInviteButton svg, button[class*='cl-membersPageInviteButton'] svg {
          color: #ffffff !important;
        }
        .cl-membersPageInviteButton path, button[class*='cl-membersPageInviteButton'] path {
          fill: #ffffff !important;
        }
        .cl-formButtonReset {
          background-color: #dbeafe !important;
        }
        .cl-formButtonPrimary {
          background-color: #3e63dd !important;
        } 
        .cl-formButtonPrimary, button[class*='cl-formButtonPrimary'], button[class*='cl-internal-g2dmbx'] {
          color: #ffffff !important;
        }
        .cl-formButtonPrimary *, button[class*='cl-formButtonPrimary'] *, button[class*='cl-internal-g2dmbx'] * {
          color: #ffffff !important;
        }
      `

    return () => {
      if (styleElement) {
        styleElement.remove()
      }
    }
  }, [currentTheme])

  const clerkAppearance = {
    baseTheme:
      currentTheme === "dark" ? dark : light,
    variables: {
      colorPrimary:
        currentTheme === "dark"
          ? "#ffffff"
          : "#2d3748",
      colorText:
        currentTheme === "dark"
          ? "#ffffff"
          : "#2d3748",
      colorTextSecondary:
        currentTheme === "dark"
          ? "#e0e0e0"
          : "#333333",
      colorBackground:
        currentTheme === "dark"
          ? "#262626"
          : "#ffffff",
    },
    elements: {
      navbar: "hidden",
      card: "shadow-none rounded-none border-none rounded-[0.4rem] w-[83.5vw] h-[87vh] p-0",
      cardBox: "grid-cols-1",
      headerTitle: "hidden",
      headerSubtitle: "hidden",
      formFieldInput: {
        backgroundColor:
          currentTheme === "dark"
            ? "#374151"
            : "#f9fafb",
        color:
          currentTheme === "dark"
            ? "#ffffff"
            : "#2d3748",
        borderColor:
          currentTheme === "dark"
            ? "#4b5563"
            : "#e5e7eb",
      },
      formButtonPrimary: {
        backgroundColor:
          currentTheme === "dark"
            ? "#000000"
            : "#e5e7eb",
        color:
          currentTheme === "dark"
            ? "#ffffff"
            : "#000000",
        border:
          currentTheme === "dark"
            ? "1px solid #ffffff"
            : "1px solid transparent",
        "&:hover": {
          backgroundColor:
            currentTheme === "dark"
              ? "#333333"
              : "#d1d5db",
          color:
            currentTheme === "dark"
              ? "#ffffff"
              : "#000000",
          border:
            currentTheme === "dark"
              ? "1px solid #ffffff"
              : "1px solid transparent",
        },
      },
      userPreviewMainIdentifier: {
        color:
          currentTheme === "dark"
            ? "#ffffff"
            : "#2d3748",
      },
      userPreviewSecondaryIdentifier: {
        color:
          currentTheme === "dark"
            ? "#d1d5db"
            : "#6b7280",
      },
      navigationTabButton: {
        backgroundColor:
          currentTheme === "dark"
            ? "#000000"
            : "#e5e7eb",
        color:
          currentTheme === "dark"
            ? "#ffffff"
            : "#3e63dd",
        border:
          currentTheme === "dark"
            ? "1px solid #ffffff"
            : "1px solid transparent",
        "&:hover": {
          backgroundColor:
            currentTheme === "dark"
              ? "#333333"
              : "#d1d5db",
          color:
            currentTheme === "dark"
              ? "#ffffff"
              : "#000000",
        },
      },
    },
    css: {
      card: {
        margin: "-20px 0 0 0",
        backgroundColor:
          currentTheme === "dark"
            ? "#262626"
            : "#ffffff",
        color:
          currentTheme === "dark"
            ? "#ffffff"
            : "#2d3748",
      },
      ".cl-component": {
        color:
          currentTheme === "dark"
            ? "#ffffff"
            : "#2d3748",
      },
      ".cl-headerTitle, .cl-headerSubtitle, .cl-label, .cl-breadcrumbItem, .cl-internal-16w826v":
        {
          color:
            currentTheme === "dark"
              ? "#ffffff"
              : "#2d3748",
        },
      ".cl-organizationProfileNavigation": {
        backgroundColor:
          currentTheme === "dark"
            ? "#262626"
            : "#ffffff",
      },
      ".cl-organizationProfilePage nav": {
        borderBottomColor:
          currentTheme === "dark"
            ? "#4b5563"
            : "#e5e7eb",
      },
      "button.cl-tabButton, .cl-tabButton[class*='cl-internal']":
        {
          backgroundColor:
            currentTheme === "dark"
              ? "#000000"
              : "#e5e7eb",
          color:
            currentTheme === "dark"
              ? "#ffffff"
              : "#000000",
          border:
            currentTheme === "dark"
              ? "1px solid #ffffff"
              : "1px solid transparent",
        },
      "button.cl-tabButton[data-state='active'], .cl-tabButton[data-state='active'][class*='cl-internal']":
        {
          backgroundColor:
            currentTheme === "dark"
              ? "#000000"
              : "#e5e7eb",
          color:
            currentTheme === "dark"
              ? "#ffffff"
              : "#000000",
          borderBottomColor:
            currentTheme === "dark"
              ? "#ffffff"
              : "#2d3748",
        },
      "button.cl-tabButton:hover, .cl-tabButton:hover[class*='cl-internal']":
        {
          backgroundColor:
            currentTheme === "dark"
              ? "#333333"
              : "#d1d5db",
          color:
            currentTheme === "dark"
              ? "#ffffff"
              : "#000000",
        },
      ".cl-membersPageInviteButton, button[class*='cl-membersPageInviteButton']":
        {
          backgroundColor:
            currentTheme === "dark"
              ? "#000000"
              : "#3e63dd",
          color:
            currentTheme === "dark"
              ? "#000000"
              : "#ffffff",
          border:
            currentTheme === "dark"
              ? "1px solid #ffffff"
              : "1px solid transparent",
        },
      ".cl-membersPageInviteButton svg, button[class*='cl-membersPageInviteButton'] svg, button[class*='cl-membersPageInviteButton'] path":
        {
          fill:
            currentTheme === "dark"
              ? "#2d3748"
              : "#ffffff",
        },
      ".cl-organizationSwitcherTriggerButton, .cl-headerTitle, .cl-headerSubtitle":
        {
          color:
            currentTheme === "dark"
              ? "#ffffff !important"
              : "#2d3748",
        },
    },
  }

  return (
    <Grid
      className={`flex justify-start transition-colors duration-200 ${
        currentTheme === "dark"
          ? "bg-neutral-800 text-white"
          : "bg-white text-[#2d3748]"
      }`}
    >
      <OrganizationProfile
        appearance={clerkAppearance}
      />
    </Grid>
  )
}

export default Members
