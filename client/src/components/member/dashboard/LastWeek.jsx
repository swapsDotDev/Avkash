import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from "chart.js"
import { Bar } from "react-chartjs-2"
import React, { useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { useUser } from "@clerk/clerk-react"
import { Box } from "@radix-ui/themes"
import FadeLoader from "react-spinners/FadeLoader"
import { useTranslation } from "react-i18next"
import { useOrganizationContext } from "../../OrganizationContext"
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip
)

function LastWeekChart() {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const { user } = useUser()
  const { t } = useTranslation()
  const { organizationName, org_slug } =
    useOrganizationContext()
  const [currentTheme, setCurrentTheme] =
    useState(() => {
      return (
        localStorage.getItem("theme") || "light"
      )
    })

  useEffect(() => {
    const observer = new MutationObserver(
      (mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.attributeName ===
            "data-theme"
          ) {
            setCurrentTheme(
              document.documentElement.getAttribute(
                "data-theme"
              ) || "light"
            )
          }
        })
      }
    )
    observer.observe(document.documentElement, {
      attributes: true,
    })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = () => {
    const currentDate = new Date()
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(
      startOfWeek.getDate() -
        startOfWeek.getDay() -
        6
    )

    const endOfWeek = new Date(currentDate)
    endOfWeek.setDate(
      endOfWeek.getDate() - endOfWeek.getDay() - 2
    )

    axios
      .get(
        `${BASE_URL}/timesheetdata/${user.id}`,
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )
      .then((response) => {
        if (response.data) {
          const backend =
            response.data.timesheet_data
          const lastWeekData = backend.filter(
            (record) => {
              const recordDate = new Date(
                record.date
              )
              return (
                recordDate >= startOfWeek &&
                recordDate <= endOfWeek
              )
            }
          )

          const workedHoursArray = [
            t("Mon"),
            t("Tue"),
            t("Wed"),
            t("Thu"),
            t("Fri"),
          ].map((dayOfWeek) => {
            const dayData = lastWeekData.find(
              (record) =>
                new Date(record.date).getDay() ===
                [
                  t("Mon"),
                  t("Tue"),
                  t("Wed"),
                  t("Thu"),
                  t("Fri"),
                ].indexOf(dayOfWeek) +
                  1
            )
            return dayData
              ? dayData.worked_hours || 0
              : 0
          })
          if (backend.length > 0) {
            setChartData(workedHoursArray)
          }
        }
        setLoading(false)
      })
      .catch(() => {
        toast.error("Error fetching data")
        setLoading(false)
      })
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        bodyColor:
          currentTheme === "dark"
            ? "#fff"
            : "#666",
        backgroundColor:
          currentTheme === "dark"
            ? "#374151"
            : "#fff",
        titleColor:
          currentTheme === "dark"
            ? "#fff"
            : "#333",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: t("days"),
          font: {
            weight: "bold",
            size: 14,
          },
          color:
            currentTheme === "dark"
              ? "white"
              : "black-100",
        },
        grid: {
          display: false,
        },
        ticks: {
          color:
            currentTheme === "dark"
              ? "#e5e7eb"
              : "#333",
        },
      },
      y: {
        title: {
          display: true,
          text: t("workedHours"),
          font: {
            weight: "bold",
            size: 14,
          },
          color:
            currentTheme === "dark"
              ? "white"
              : "black-100",
        },
        grid: {
          display: false,
        },
        ticks: {
          color:
            currentTheme === "dark"
              ? "#e5e7eb"
              : "#333",
        },
      },
    },
  }

  const labels = [
    t("Mon"),
    t("Tue"),
    t("Wed"),
    t("Thu"),
    t("Fri"),
  ]

  const data = {
    labels,
    datasets: [
      {
        data: chartData,
        backgroundColor: "rgba(53, 162, 235, 1)",
      },
    ],
  }

  return (
    <>
      {chartData.length > 0 ? (
        <Box className="h-[34vh] m-auto dark:bg-gray-800 dark:text-white p-4 rounded-lg">
          <Bar
            options={options}
            data={data}
            className="min-w-[100%] min-h-[100%]"
          />
        </Box>
      ) : (
        <Box className="flex justify-center items-center h-[190px] dark:bg-gray-800 dark:text-white rounded-lg">
          {loading ? (
            <FadeLoader
              color={
                currentTheme === "dark"
                  ? "#ffffff"
                  : "#2563eb"
              }
            />
          ) : (
            <Box className="text-center text-xl py-[50px] text-gray-600 dark:text-gray-300">
              {t("noData")}
            </Box>
          )}
        </Box>
      )}
    </>
  )
}

export default LastWeekChart
