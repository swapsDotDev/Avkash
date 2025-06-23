import React, { useState, useEffect } from "react"
import {
  Link,
  useLocation,
  NavLink,
} from "react-router-dom"
import { Text, Box } from "@radix-ui/themes"
import Squares2X2Icon from "@heroicons/react/24/outline/Squares2X2Icon"
import Cog6ToothIcon from "@heroicons/react/24/outline/Cog6ToothIcon"
import DocumentTextIcon from "@heroicons/react/24/outline/DocumentTextIcon"
import CheckIcon from "@heroicons/react/24/outline/CheckIcon"
import UsersIcon from "@heroicons/react/24/outline/UsersIcon"
import EnvelopeIcon from "@heroicons/react/24/outline/EnvelopeIcon"
import BuildingOffice2Icon from "@heroicons/react/24/outline/BuildingOffice2Icon"
import ArrowTopRightOnSquareIcon from "@heroicons/react/24/outline/ArrowTopRightOnSquareIcon"
import CurrencyDollarIcon from "@heroicons/react/24/outline/CurrencyDollarIcon"
import CalendarDaysIcon from "@heroicons/react/24/outline/CalendarDaysIcon"
import { BsCreditCard } from "react-icons/bs"
import { useTranslation } from "react-i18next"
import { useOrganizationContext } from "../OrganizationContext"
import "../Style.css"
import { GoOrganization } from "react-icons/go"
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md"
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md"
import BriefcaseIcon from "@heroicons/react/24/outline/BriefcaseIcon"
import PropTypes from "prop-types"
import ReimbursementIcon from "../assets/reimbursement.png"
const RouteLink = ({
  routeLink,
  Icon,
  routeName,
  isMobile,
}) => {
  const location = useLocation()
  return (
    <NavLink
      end
      to={`/${routeLink}`}
      className={({ isActive }) =>
        `flex items-center py-2.5 my-1.7 transition-colors duration-200
      ${isMobile ? "w-[38px]" : "w-[180px]"}
      ${
        isActive
          ? "font-semibold bg-base-200 dark:bg-gray-800 text-black dark:text-white relative"
          : "font-normal bg-white dark:bg-gray-900 text-black dark:text-white"
      }`
      }
    >
      {isMobile ? (
        <Icon
          className="h-6 w-6 ml-2 mx-2 text-black dark:text-white"
          size={80}
        />
      ) : (
        <>
          <Icon className="h-6 w-6 mx-2 icon-size text-black dark:text-white" />
          <span className="text-black dark:text-white">
            {routeName}
          </span>
        </>
      )}
      {location.pathname === `/${routeLink}` ? (
        <span
          className="absolute inset-y-0 left-0 w-1 rounded-tr-md rounded-br-md bg-primary"
          aria-hidden="true"
        ></span>
      ) : null}
    </NavLink>
  )
}
RouteLink.propTypes = {
  routeLink: PropTypes.string.isRequired,
  Icon: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]).isRequired,
  routeName: PropTypes.string.isRequired,
  isMobile: PropTypes.bool.isRequired,
}
const Iconsidebar = ({
  routeLink,
  Icon,
  routeName,
  Manual,
}) => {
  const location = useLocation()
  return (
    <NavLink
      end
      to={`/${routeLink}`}
      className={({ isActive }) =>
        `flex items-center py-2 my-2 ${Manual ? "w-[38px]" : ""} ${isActive ? "font-semibold bg-base-200 dark:bg-gray-600 relative" : "font-normal"}`
      }
    >
      {Manual ? (
        <Icon
          className="h-6 w-6 ml-3 dark:text-white"
          size={80}
        />
      ) : (
        <>
          <Icon className="h-6 w-6 mx-2 icon-size dark:text-white" />
          <span className="dark:text-white">
            <span>{routeName}</span>
          </span>
        </>
      )}
      {location.pathname === `/${routeLink}` ? (
        <span
          className="absolute inset-y-0 left-0 w-1 rounded-tr-md rounded-br-md bg-primary"
          aria-hidden="true"
        ></span>
      ) : null}
    </NavLink>
  )
}
Iconsidebar.propTypes = {
  routeLink: PropTypes.string.isRequired,
  Icon: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]).isRequired,
  routeName: PropTypes.string.isRequired,
  Manual: PropTypes.bool.isRequired,
}
function GlobalSidebar({
  isAdmin,
  isSuperAdmin,
}) {
  const { t } = useTranslation()
  const [windowWidth, setWindowWidth] = useState(
    window.innerWidth
  )
  const [isMobile, setIsMobile] = useState(
    windowWidth <= 768
  )
  const [sidebarExpanded, setSidebarExpanded] =
    useState(true)
  const showRouteNames = true
  const { organizationName, organizationImage } =
    useOrganizationContext()

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      sidebarExpanded ? "210px" : "70px"
    )

    if (sidebarExpanded) {
      document.body.classList.remove(
        "sidebar-collapsed"
      )
    } else {
      document.body.classList.add(
        "sidebar-collapsed"
      )
    }

    return () => {
      document.body.classList.remove(
        "sidebar-collapsed"
      )
    }
  }, [sidebarExpanded])

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setWindowWidth(width)
      setIsMobile(width <= 768)

      if (width <= 768 && sidebarExpanded) {
        setSidebarExpanded(false)
      }
    }
    handleResize()
    window.addEventListener(
      "resize",
      handleResize
    )
    return () =>
      window.removeEventListener(
        "resize",
        handleResize
      )
  }, [sidebarExpanded])

  const routes = {
    superAdmin: [
      {
        routeLink: "dashboard",
        Icon: Squares2X2Icon,
        routeName: "Dashboard",
      },
      {
        routeLink: "leaverequest",
        Icon: CheckIcon,
        routeName: "Leave Requests",
      },
      {
        routeLink: "members",
        Icon: UsersIcon,
        routeName: "Members",
      },
      {
        routeLink: "reimbursement",
        Icon: () => (
          <img
            src={ReimbursementIcon}
            alt="Reimbursement"
            className="h-6 w-6 mx-2 dark:invert"
          />
        ),
        routeName: "Reimbursement",
      },
      {
        routeLink: "documents",
        Icon: DocumentTextIcon,
        routeName: "Documents",
      },
      {
        routeLink: "feedbacks",
        Icon: EnvelopeIcon,
        routeName: "Feedbacks",
      },
      {
        routeLink: "department",
        Icon: BuildingOffice2Icon,
        routeName: "Departments",
      },
      {
        routeLink: "recruiterDesk",
        Icon: BriefcaseIcon,
        routeName: "RecruiterDesk",
      },
      {
        routeLink: "holidays",
        Icon: CalendarDaysIcon,
        routeName: "Holidays",
      },
      {
        routeLink: "payroll",
        Icon: BsCreditCard,
        routeName: "Payroll",
      },
      {
        routeLink: "memberinfo",
        Icon: UsersIcon,
        routeName: "Member Info",
      },
      {
        routeLink: "noticeboard",
        Icon: DocumentTextIcon,
        routeName: "Notice Board",
      },
      {
        routeLink: "organizationchart",
        Icon: GoOrganization,
        routeName: "Organization Chart",
      },
    ],
    admin: [
      {
        routeLink: "dashboard",
        Icon: Squares2X2Icon,
        routeName: "Dashboard",
      },
      {
        routeLink: "leaverequest",
        Icon: CheckIcon,
        routeName: "Leave Requests",
      },
      {
        routeLink: "reimbursement",
        Icon: () => (
          <img
            src={ReimbursementIcon}
            alt="Reimbursement"
            className="h-6 w-6 mx-2 dark:invert"
          />
        ),
        routeName: "Reimbursement",
      },
      {
        routeLink: "feedbacks",
        Icon: EnvelopeIcon,
        routeName: "Feedbacks",
      },
      {
        routeLink: "department",
        Icon: BuildingOffice2Icon,
        routeName: "Departments",
      },
      {
        routeLink: "recruiterDesk",
        Icon: BriefcaseIcon,
        routeName: "RecruiterDesk",
      },
      {
        routeLink: "holidays",
        Icon: CalendarDaysIcon,
        routeName: "Holidays",
      },
      {
        routeLink: "payroll",
        Icon: BsCreditCard,
        routeName: "Payroll",
      },
      {
        routeLink: "memberinfo",
        Icon: UsersIcon,
        routeName: "Member Info",
      },
      {
        routeLink: "noticeboard",
        Icon: DocumentTextIcon,
        routeName: "Notice Board",
      },
      {
        routeLink: "documents",
        Icon: DocumentTextIcon,
        routeName: "Documents",
      },
      {
        routeLink: "organizationchart",
        Icon: GoOrganization,
        routeName: "Organization Chart",
      },
    ],
    user: [
      {
        routeLink: "dashboard",
        Icon: Squares2X2Icon,
        routeName: t("dashboard"),
      },
      {
        routeLink: "applyleave",
        Icon: ArrowTopRightOnSquareIcon,
        routeName: t("applyLeave"),
      },
      {
        routeLink: "payslip",
        Icon: CurrencyDollarIcon,
        routeName: t("payslip"),
      },
      {
        routeLink: "membernoticeboard",
        Icon: DocumentTextIcon,
        routeName: "Notice Board",
      },
      {
        routeLink: "referralportal",
        Icon: BriefcaseIcon,
        routeName: "Referral Portal",
      },
      {
        routeLink: "reimbursement",
        Icon: () => (
          <img
            src={ReimbursementIcon}
            alt="Reimbursement"
            className="h-6 w-6 ml-2 dark:invert"
          />
        ),
        routeName: "Reimbursement",
      },
      {
        routeLink: "documents",
        Icon: DocumentTextIcon,
        routeName: "Documents",
      },
      {
        routeLink: "setting",
        Icon: Cog6ToothIcon,
        routeName: t("settings"),
      },
      {
        routeLink: "helpsupport",
        Icon: DocumentTextIcon,
        routeName: t("helpSupport"),
      },
    ],
  }
  const userRoutes = isSuperAdmin
    ? routes.superAdmin
    : isAdmin
      ? routes.admin
      : routes.user

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded)
  }

  return (
    <div className="rt-Box h-full bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="bg-white dark:bg-gray-900 text-black dark:text-white">
        <div
          className={`sidebar-container bg-white dark:bg-gray-900 text-black dark:text-white`}
          style={{
            width: sidebarExpanded
              ? "210px"
              : "70px",
          }}
        >
          <div
            className={`sidebar ${sidebarExpanded ? "" : "sidebar-collapsed"} bg-white dark:bg-gray-900 text-black dark:text-white`}
          >
            <div className="flex flex-col sidebar-header no-shadow">
              <Link to="/dashboard">
                <Box className="flex items-center mt-5 ml-2">
                  <Box>
                    <img
                      src={organizationImage}
                      alt="Organization Logo"
                      className="mx-3 w-10 h-10"
                    />
                  </Box>
                  {sidebarExpanded && (
                    <Text
                      className="inline-block"
                      size="5"
                      weight="bold"
                    >
                      {organizationName}
                    </Text>
                  )}
                </Box>
              </Link>

              {!isMobile && (
                <button
                  onClick={toggleSidebar}
                  className="rounded-full text-black dark:text-white focus:outline-none p-1 self-end mr-0.3 z-5"
                  aria-label={
                    sidebarExpanded
                      ? "Collapse sidebar"
                      : "Expand sidebar"
                  }
                >
                  {sidebarExpanded ? (
                    <MdOutlineKeyboardDoubleArrowLeft
                      size={16}
                    />
                  ) : (
                    <MdOutlineKeyboardDoubleArrowRight
                      size={16}
                    />
                  )}
                </button>
              )}

              <div className="sidebar-menu-container px-2 py-1">
                {userRoutes.map(
                  ({
                    routeLink,
                    Icon,
                    routeName,
                  }) =>
                    sidebarExpanded ? (
                      <RouteLink
                        key={routeLink}
                        routeLink={routeLink}
                        Icon={Icon}
                        routeName={routeName}
                        isMobile={false}
                      />
                    ) : (
                      <Iconsidebar
                        key={routeLink}
                        routeLink={routeLink}
                        Icon={Icon}
                        routeName={
                          showRouteNames
                            ? routeName
                            : ""
                        }
                        Manual={true}
                      />
                    )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
GlobalSidebar.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  isSuperAdmin: PropTypes.bool.isRequired,
}

export default GlobalSidebar
