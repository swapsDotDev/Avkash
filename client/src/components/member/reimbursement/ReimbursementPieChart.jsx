import React, {
  useState,
  useEffect,
  useCallback,
} from "react"
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import axios from "axios"
import { useUser } from "@clerk/clerk-react"
import { useOrganizationContext } from "../../OrganizationContext"
import { FadeLoader } from "react-spinners"
import PropTypes from "prop-types"

const BASE_URL = process.env.REACT_APP_BASE_URL

function ReimbursementPieChart() {
  const [categoryData, setCategoryData] =
    useState({})
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useUser()
  const { organizationName, org_slug, socket } =
    useOrganizationContext()

  const COLORS = [
    "#3366cc",
    "#4bc0c0",
    "#ff9f40",
    "#ff6384",
    "#9966ff",
    "#ffcd56",
    "#c9cbcf",
  ]
  const NO_DATA_COLOR = "#c9cbcf"

  const fetchReimbursementDetails =
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

        const categoryTotals = {}

        response.data.reimbursement_requests.forEach(
          (request) => {
            if (
              request.expenses &&
              request.expenses.length > 0
            ) {
              request.expenses.forEach(
                (expense) => {
                  if (
                    expense.categories &&
                    expense.categories.length > 0
                  ) {
                    const amount = parseFloat(
                      expense.amount || 0
                    )
                    const categoryCount =
                      expense.categories.length
                    const amountPerCategory =
                      amount / categoryCount

                    expense.categories.forEach(
                      (category) => {
                        categoryTotals[category] =
                          (categoryTotals[
                            category
                          ] || 0) +
                          amountPerCategory
                      }
                    )
                  } else {
                    const category = "Others"
                    const amount = parseFloat(
                      expense.amount || 0
                    )
                    categoryTotals[category] =
                      (categoryTotals[category] ||
                        0) + amount
                  }
                }
              )
            } else {
              const category =
                request.reimbursement_type ||
                "Others"
              const amount = parseFloat(
                request.totalAmount ||
                  request.amount ||
                  0
              )
              categoryTotals[category] =
                (categoryTotals[category] || 0) +
                amount
            }
          }
        )

        const defaultCategories = [
          "Travel",
          "Meals",
          "Equipment",
          "Others",
        ]
        defaultCategories.forEach((category) => {
          categoryTotals[category] =
            categoryTotals[category] || 0
        })

        setCategoryData(categoryTotals)
      } catch (error) {
        // silently catch the error
      } finally {
        setIsLoading(false)
      }
    }, [user?.id, organizationName, org_slug])

  useEffect(() => {
    fetchReimbursementDetails()
  }, [fetchReimbursementDetails])

  useEffect(() => {
    if (!socket) return

    const handleWebSocketMessage = (event) => {
      const data = JSON.parse(event.data)
      if (
        [
          "reimbursement_update",
          "new_reimbursement",
          "reimbursement_status_change",
        ].includes(data.type)
      ) {
        fetchReimbursementDetails()
      }
    }

    const handleOpen = () => {
      if (
        organizationName &&
        user?.id &&
        socket.readyState === WebSocket.OPEN
      ) {
        socket.send(
          JSON.stringify({
            action: "subscribe",
            channel: `reimbursements_${org_slug}`,
            user_id: user.id,
          })
        )
      }
    }

    socket.addEventListener(
      "message",
      handleWebSocketMessage
    )
    socket.addEventListener("open", handleOpen)
    if (socket.readyState === WebSocket.OPEN)
      handleOpen()

    return () => {
      socket.removeEventListener(
        "message",
        handleWebSocketMessage
      )
      socket.removeEventListener(
        "open",
        handleOpen
      )
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            action: "unsubscribe",
            channel: `reimbursements_${org_slug}`,
            user_id: user.id,
          })
        )
      }
    }
  }, [
    socket,
    organizationName,
    org_slug,
    user?.id,
    fetchReimbursementDetails,
  ])

  const prepareChartData = () => {
    const data = Object.keys(categoryData)
      .map((category) => ({
        name: category,
        value: categoryData[category],
      }))
      .filter((item) => item.value > 0)

    return data.length > 0
      ? data
      : [{ name: "No Data Available", value: 1 }]
  }

  const chartData = prepareChartData()
  const totalAmount = Object.values(
    categoryData
  ).reduce((sum, value) => sum + value, 0)
  const hasData = totalAmount > 0

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length && hasData) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 text-black dark:text-white p-4 rounded shadow-md border border-gray-200 dark:border-gray-600">
          <p className="font-semibold">
            {data.name}
          </p>
          <p>{formatCurrency(data.value)}</p>
          <p>
            {(
              (data.value / totalAmount) *
              100
            ).toFixed(1)}
            % of total
          </p>
        </div>
      )
    }
    return null
  }

  CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.arrayOf(
      PropTypes.shape({
        payload: PropTypes.shape({
          name: PropTypes.string.isRequired,
          value: PropTypes.number.isRequired,
        }),
      })
    ),
  }

  if (isLoading) {
    return (
      <div
        className="flex justify-center items-center h-48 w-full p-6 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg shadow-md"
        style={{ height: "313px" }}
      >
        <FadeLoader color="#2563eb" />
      </div>
    )
  }

  return (
    <div
      className="relative flex flex-col rounded-[0.4rem] w-full p-6 py-3 bg-white dark:bg-gray-800 text-black dark:text-white shadow-xl mt-3 border border-gray-300 dark:border-gray-600"
      style={{ minHeight: "313px" }}
    >
      <div className="text-xl font-semibold mb-2">
        Reimbursement Expenses
      </div>
      <div className="border-b border-gray-200 dark:border-gray-600 mb-3"></div>

      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={hasData ? 2 : 0}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    hasData
                      ? COLORS[
                          index % COLORS.length
                        ]
                      : NO_DATA_COLOR
                  }
                />
              ))}
            </Pie>
            {hasData && (
              <Tooltip
                content={<CustomTooltip />}
              />
            )}
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{
                fontSize: "12px",
                padding: "0px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {hasData && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="text-base font-semibold">
            Total: {formatCurrency(totalAmount)}
          </div>
        </div>
      )}
    </div>
  )
}

export default ReimbursementPieChart
