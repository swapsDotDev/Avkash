import React from "react"
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"
import {
  SignedIn,
  SignedOut,
  useUser,
  useOrganization,
} from "@clerk/clerk-react"
import {
  useState,
  useEffect,
  useRef,
} from "react"
import { Box, ScrollArea } from "@radix-ui/themes"
import { Outlet } from "react-router-dom"
import Login from "./components/authentication/Login"
import Signup from "./components/authentication/Signup"
import PageError from "./components/errors/PageError.jsx"
import Sidebar from "./components/navbar/GlobalSidebar"
import Tabbar from "./components/navbar/Tabbar"
import AdminContent from "./components/admin/dashboard/AdminContent"
import Feedbacks from "./components/admin/Feedback/Feedbacks"
import MemberContent from "./components/member/dashboard/MemberContent"
import LeaveRequest from "./components/admin/LeaveRequests/LeaveRequest"
import Members from "./components/admin/Members"
import Applyleave from "./components/member/applyleave/Applyleave"
import Payslip from "./components/member/payslip/Payslip"
import ReimbursementDashboard from "./components/member/reimbursement/ReimbursementDashboard"
import Setting from "./components/member/setting/Setting"
import Helpsupport from "./components/member/help&support/Helpsupport"
import LeaveRequestSystem from "./components/member/help&support/LeaveRequestSystem"
import LeavePolicies from "./components/member/help&support/LeavePolicies"
import BillingPage from "./components/admin/Billing/Payslipbilling.jsx"
import "./App.css"
import Department from "./components/admin/department/Department"
import Memberinfo from "./components/admin/Memberinfo"
import Chatbot from "./components/member/Chatbot"
import { themeChange } from "theme-change"
import Holidays from "./components/admin/holiday/Holidays"
import Organizationchart from "./components/admin/Orgnizationchart/Organizationchart.jsx"
import axios from "axios"
import { Protect } from "@clerk/clerk-react"
import { useStopwatch } from "react-timer-hook"
import Createorg from "./components/authentication/Createorg"
import toast, { Toaster } from "react-hot-toast"
import WelcomeToast from "./components/WelcomeToast.jsx"
import { useOrganizationContext } from "./components/OrganizationContext.jsx"
import Career from "./components/admin/Career/Career.jsx"
import PropTypes from "prop-types"
import NoticeBoard from "./components/admin/Noticeboard/NoticeBoard.jsx"
import MemberNoticeBoard from "./components/member/noticeboard/MemberNoticeBoard.jsx"
import MemberDashboard from "./components/member/Referals/MemberDashboard.jsx"
import ReimbursementAdminDashboard from "./components/admin/reimbursement/ReimbursementAdminDashboard.jsx"
import AdminDocuments from "./components/admin/Documents/AdminDoc.jsx"
import Documents from "./components/member/Documents/MemberDoc.jsx"

function App() {
  const { user, isLoaded: isUserLoaded } =
    useUser()
  const { organization, isLoaded: isOrgLoaded } =
    useOrganization()
  const { organizationName, org_slug } =
    useOrganizationContext()
  const [isAdmin, setIsAdmin] = useState(false)
  const mainContentRef = useRef(null)
  const [isSuperAdmin, setIsSuperAdmin] =
    useState(false)
  const timer = useStopwatch()
  const [isaccess, setisaccess] = useState(false)
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isUserLoaded && isOrgLoaded) {
      if (user) {
        if (
          user.organizationMemberships &&
          user.organizationMemberships.length > 0
        ) {
          setisaccess(true)
          if (organization && organizationName) {
            axios
              .get(
                `${BASE_URL}/deleteallolddata/${organization.id}`,
                {
                  params: {
                    organization_name:
                      organizationName,
                    org_slug: org_slug,
                  },
                }
              )
              .catch(() => {
                toast.error(
                  "Error Delete previous data"
                )
              })
            const role =
              user.organizationMemberships.find(
                (membership) =>
                  membership.organization.id ===
                  organization.id
              )?.role || "member"
            setIsAdmin(role.includes("admin"))
            setIsSuperAdmin(
              role.includes("superadmin")
            )
            const validRoles = [
              "member",
              "admin",
              "superadmin",
            ]
            const validRole = validRoles.some(
              (r) => role.includes(r)
            )
            const user_role = role.includes(
              "superadmin"
            )
              ? "superadmin"
              : role.includes("admin")
                ? "admin"
                : "member"
            if (validRole) {
              axios
                .post(
                  `${BASE_URL}/userDetails`,
                  {
                    user_id: user.id,
                    user_role: user_role,
                    user_name: user.fullName,
                    imageUrl: user.imageUrl,
                    organization_name:
                      organizationName,
                    org_slug: org_slug,
                    email:
                      user?.emailAddresses?.[0]
                        ?.emailAddress,
                    ...(role.includes(
                      "superadmin"
                    ) && {
                      role: "CEO",
                    }),
                  },
                  {
                    params: {
                      organization_name:
                        organizationName,
                      org_slug: org_slug,
                    },
                  }
                )
                .catch(() => {})
            }
          }

          themeChange(false)
        } else {
          setisaccess(false)
        }
      } else {
        setisaccess(false)
      }
      setIsLoading(false)
    }
  }, [
    user,
    organization,
    organizationName,
    org_slug,
    isUserLoaded,
    isOrgLoaded,
  ])

  const routes = {
    superAdmin: [
      {
        path: "/dashboard",
        element: <AdminContent />,
      },
      {
        path: "/leaverequest",
        element: <LeaveRequest />,
      },
      { path: "/members", element: <Members /> },
      {
        path: "/reimbursement",
        element: <ReimbursementAdminDashboard />,
      },
      {
        path: "/feedbacks",
        element: <Feedbacks />,
      },
      {
        path: "/payroll",
        element: <BillingPage />,
      },
      {
        path: "/department",
        element: <Department />,
      },
      {
        path: "/recruiterDesk",
        element: <Career />,
      },
      {
        path: "/holidays",
        element: <Holidays />,
      },
      {
        path: "/memberinfo",
        element: <Memberinfo />,
      },
      {
        path: "/noticeboard",
        element: <NoticeBoard />,
      },
      {
        path: "/documents",
        element: <AdminDocuments />,
      },
      {
        path: "/organizationchart",
        element: <Organizationchart />,
      },
    ],
    admin: [
      {
        path: "/dashboard",
        element: <AdminContent />,
      },
      {
        path: "/leaverequest",
        element: <LeaveRequest />,
      },
      {
        path: "/reimbursement",
        element: <ReimbursementAdminDashboard />,
      },
      {
        path: "/feedbacks",
        element: <Feedbacks />,
      },
      {
        path: "/department",
        element: <Department />,
      },
      {
        path: "/RecruiterDesk",
        element: <Career />,
      },
      {
        path: "/holidays",
        element: <Holidays />,
      },
      {
        path: "/payroll",
        element: <BillingPage />,
      },
      {
        path: "/memberinfo",
        element: <Memberinfo />,
      },
      {
        path: "/noticeboard",
        element: <NoticeBoard />,
      },
      {
        path: "/documents",
        element: <AdminDocuments />,
      },
      {
        path: "/organizationchart",
        element: <Organizationchart />,
      },
    ],
    user: [
      {
        path: "/dashboard",
        element: <MemberContent timer={timer} />,
      },
      {
        path: "/applyleave",
        element: <Applyleave />,
      },
      {
        path: "/payslip",
        element: <Payslip />,
      },
      {
        path: "/membernoticeboard",
        element: <MemberNoticeBoard />,
      },
      {
        path: "referralportal",
        element: <MemberDashboard />,
      },
      {
        path: "/reimbursement",
        element: <ReimbursementDashboard />,
      },
      {
        path: "/documents",
        element: <Documents />,
      },
      {
        path: "/setting",
        element: <Setting />,
      },
      {
        path: "/helpsupport",
        element: <Helpsupport />,
      },
      {
        path: "/leave-request",
        element: <LeaveRequestSystem />,
      },
      {
        path: "/leave-policies",
        element: <LeavePolicies />,
      },
    ],
  }

  const roleRoutes = [
    {
      role: "org:superadmin",
      routes: routes.superAdmin,
      isAllowed: isSuperAdmin,
    },
    {
      role: "org:admin",
      routes: routes.admin,
      isAllowed: isAdmin,
    },
    {
      role: "org:member",
      routes: routes.user,
      isAllowed: !isSuperAdmin && !isAdmin,
    },
  ]

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="loading-spinner animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <SignedOut>
        <Routes>
          <Route
            exact
            path="/"
            element={<Login />}
          />
          <Route
            path="/signup"
            element={<Signup />}
          />
          <Route
            path="*"
            element={<Login />}
          />
        </Routes>
      </SignedOut>
      <SignedIn>
        {isaccess ? (
          <Routes>
            <Route
              path="*"
              element={
                <PageError errorType="404" />
              }
            />
            <Route
              element={
                <AuthenticatedLayout
                  isSuperAdmin={isSuperAdmin}
                  isAdmin={isAdmin}
                  mainContentRef={mainContentRef}
                />
              }
            >
              {roleRoutes.map(
                ({ role, routes, isAllowed }) =>
                  isAllowed &&
                  routes.map(
                    ({ path, element }) => (
                      <Route
                        key={path}
                        path={path}
                        element={
                          <Protect role={role}>
                            {element}
                          </Protect>
                        }
                      />
                    )
                  )
              )}
              <Route
                path="/"
                element={
                  <Navigate to="/dashboard" />
                }
              />
            </Route>
          </Routes>
        ) : (
          <Routes>
            <Route
              path="/"
              element={
                <Createorg
                  setisaccess={setisaccess}
                />
              }
            />
            <Route
              path="*"
              element={<Navigate to="/" />}
            />
          </Routes>
        )}
      </SignedIn>
    </BrowserRouter>
  )
}

function AuthenticatedLayout({
  isSuperAdmin,
  isAdmin,
  mainContentRef,
}) {
  return (
    <ScrollArea>
      <Box className="drawer h-screen w-full lg:drawer-open">
        <input
          id="left-sidebar-drawer"
          type="checkbox"
          className="drawer-toggle"
        />
        <Box className="drawer-content flex flex-col">
          <Tabbar
            isMember={!isSuperAdmin && !isAdmin}
          />
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              iconTheme: {
                style: {
                  display: "none",
                },
              },
              success: {
                style: {
                  color: "#fff",
                  background:
                    "rgb(81, 163, 81,0.9)",
                  borderRadius: "3px",
                },
              },
              error: {
                style: {
                  color: "#fff",
                  background:
                    "rgb(189, 54, 47, 0.9)",
                  borderRadius: "3px",
                },
              },
            }}
          />
          <WelcomeToast />
          <ScrollArea
            className="flex-1 h-screen pt-1.5 sm:pt-1.5 md:pt-1.5 lg:pt-2 px-2 sm:px-2 md:px-4 lg:px-4 bg-base-200"
            ref={mainContentRef}
          >
            <Outlet />{" "}
            {!isSuperAdmin && !isAdmin && (
              <Chatbot />
            )}
          </ScrollArea>
        </Box>
        <Box className="h-full">
          <Sidebar
            isAdmin={isAdmin}
            isSuperAdmin={isSuperAdmin}
          />
        </Box>
      </Box>
    </ScrollArea>
  )
}
AuthenticatedLayout.propTypes = {
  isSuperAdmin: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  mainContentRef: PropTypes.object.isRequired,
}

export default App
