import React, {
  useState,
  useEffect,
  useCallback,
} from "react"
import axios from "axios"
import { useUser } from "@clerk/clerk-react"
import { useOrganizationContext } from "../../OrganizationContext"
import { MdPendingActions } from "react-icons/md"
import { FcAcceptDatabase } from "react-icons/fc"
import { ImCross } from "react-icons/im"
import { FaSearch } from "react-icons/fa"
import { FadeLoader } from "react-spinners"

const BASE_URL = process.env.REACT_APP_BASE_URL

function ReimbursementStatus() {
  const [statusData, setStatusData] = useState({
    pending: {
      count: 0,
      color: "bg-yellow-400",
      icon: (
        <MdPendingActions className="text-black" />
      ),
    },
    approved: {
      count: 0,
      color: "bg-green-500",
      icon: (
        <FcAcceptDatabase className="text-black" />
      ),
    },
    rejected: {
      count: 0,
      color: "bg-red-500",
      icon: <ImCross className="text-black" />,
    },
    in_review: {
      count: 0,
      color: "bg-blue-500",
      icon: <FaSearch className="text-black" />,
    },
    partial: {
      count: 0,
      color: "bg-orange-500",
      icon: "🌓",
    },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [, setLastUpdated] = useState(null)
  const { user } = useUser()
  const { organizationName, org_slug, socket } =
    useOrganizationContext()

  const fetchReimbursementRequests =
    useCallback(async () => {
      if (!user?.id || !organizationName) return

      setIsLoading(true)
      try {
        const response = await axios.get(
          `${BASE_URL}/get_reimbursement_requests/${user.id}`,
          {
            params: {
              organization_name: organizationName,
              org_slug: org_slug,
            },
          }
        )

        const counts = {
          pending: {
            count: 0,
            color: "bg-yellow-400",
            icon: (
              <MdPendingActions className="text-black dark:text-white" />
            ),
          },
          approved: {
            count: 0,
            color: "bg-green-500",
            icon: (
              <FcAcceptDatabase className="text-black" />
            ),
          },
          rejected: {
            count: 0,
            color: "bg-red-500",
            icon: (
              <ImCross className="text-black dark:text-white" />
            ),
          },
          in_review: {
            count: 0,
            color: "bg-blue-500",
            icon: (
              <FaSearch className="text-black dark:text-white" />
            ),
          },
          partial: {
            count: 0,
            color: "bg-orange-500",
            icon: "🌓",
          },
        }

        response.data.reimbursement_requests.forEach(
          (request) => {
            const status = request.status
              ? request.status.toLowerCase()
              : "pending"

            if (status === "approved") {
              counts.approved.count += 1
            } else if (status === "rejected") {
              counts.rejected.count += 1
            } else if (status === "pending") {
              counts.pending.count += 1
            } else if (status === "in_review") {
              counts.in_review.count += 1
            } else if (
              status.startsWith("approved ")
            ) {
              const [, fraction] =
                status.split(" ")
              const [approved, total] = fraction
                .split("/")
                .map(Number)
              if (approved === total) {
                counts.approved.count += 1
              } else if (approved > 0) {
                counts.partial.count += 1
              } else {
                counts.rejected.count += 1
              }
            } else if (
              status.startsWith("in_review ")
            ) {
              const [, fraction] =
                status.split(" ")
              const [inReview, total] = fraction
                .split("/")
                .map(Number)
              if (inReview === total) {
                counts.in_review.count += 1
              } else {
                counts.partial.count += 1
              }
            } else if (
              status.startsWith("rejected ")
            ) {
              counts.rejected.count += 1
            } else {
              counts.pending.count += 1
            }
          }
        )

        setStatusData(counts)
        setLastUpdated(new Date())
      } catch (error) {
        ;("")
      } finally {
        setIsLoading(false)
      }
    }, [user?.id, organizationName, org_slug])

  useEffect(() => {
    fetchReimbursementRequests()
  }, [fetchReimbursementRequests])

  useEffect(() => {
    if (!socket) return

    const handleWebSocketMessage = (event) => {
      const data = JSON.parse(event.data)
      if (
        data.type === "reimbursement_update" ||
        data.type === "new_reimbursement" ||
        data.type ===
          "reimbursement_status_change"
      ) {
        fetchReimbursementRequests()
      }
    }

    const handleOpen = () => {
      if (organizationName && user?.id) {
        const subscriptionMessage =
          JSON.stringify({
            action: "subscribe",
            channel: `reimbursements_${org_slug}`,
            user_id: user.id,
          })
        socket.send(subscriptionMessage)
      }
    }

    const handleClose = () => {}
    const handleError = () => {}

    socket.addEventListener(
      "message",
      handleWebSocketMessage
    )
    socket.addEventListener("open", handleOpen)
    socket.addEventListener("close", handleClose)
    socket.addEventListener("error", handleError)

    if (socket.readyState === WebSocket.OPEN) {
      handleOpen()
    }

    return () => {
      socket.removeEventListener(
        "message",
        handleWebSocketMessage
      )
      socket.removeEventListener(
        "open",
        handleOpen
      )
      socket.removeEventListener(
        "close",
        handleClose
      )
      socket.removeEventListener(
        "error",
        handleError
      )

      if (socket.readyState === WebSocket.OPEN) {
        const unsubscribeMessage = JSON.stringify(
          {
            action: "unsubscribe",
            channel: `reimbursements_${org_slug}`,
            user_id: user.id,
          }
        )
        socket.send(unsubscribeMessage)
      }
    }
  }, [
    socket,
    organizationName,
    org_slug,
    user?.id,
    fetchReimbursementRequests,
  ])

  const calculateTotal = () => {
    return Object.values(statusData).reduce(
      (sum, { count }) => sum + count,
      0
    )
  }

  const total = calculateTotal()

  if (isLoading) {
    return (
      <div
        className="relative flex flex-col rounded-[0.4rem] w-full p-6 py-3 bg-white dark:bg-gray-800 shadow-xl mt-3 border border-gray-300 dark:border-gray-600"
        style={{ height: "310px" }}
      >
        <div className="text-xl font-semibold mb-2 dark:text-white">
          Reimbursement Status
        </div>
        <div className="border-b border-gray-200 mb-3"></div>
        <div className="flex justify-center items-center h-full">
          <FadeLoader color="#2563eb" />
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative flex flex-col rounded-[0.4rem] w-full p-6 py-3 bg-white dark:bg-gray-800 text-black dark:text-white shadow-xl mt-3 border border-gray-300 dark:border-gray-600"
      style={{ height: "313px", width: "100%" }}
    >
      <div className="text-xl font-semibold mb-2">
        Reimbursement Status
      </div>
      <div className="border-b border-gray-200 dark:border-gray-600 mb-3"></div>

      <div className="space-y-4">
        {Object.entries(statusData).map(
          ([status, { count, color, icon }]) => (
            <div
              key={status}
              className="space-y-1"
            >
              <div className="flex justify-between text-sm text-black dark:text-white">
                <span className="capitalize flex items-center">
                  <span className="mr-2">
                    {icon}
                  </span>
                  {status === "partial"
                    ? "Partially Approved"
                    : status.replace("_", " ")}
                </span>
                <span className="font-semibold">
                  {count}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                <div
                  className={`${color} h-2.5 rounded-full transition-all duration-500`}
                  style={{
                    width: `${total > 0 ? (count / total) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default ReimbursementStatus
