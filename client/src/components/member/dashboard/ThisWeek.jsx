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
import FadeLoader from "react-spinners/FadeLoader"
import axios from "axios"
import toast from "react-hot-toast"
import { Box } from "@radix-ui/themes"
import { useUser } from "@clerk/clerk-react"
import { useTranslation } from "react-i18next"
import { useOrganizationContext } from "../../OrganizationContext"
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip
)

function CurrentWeekChart() {
  const [chartData, setChartData] = useState([])
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(true)
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
      startOfWeek.getDate() - startOfWeek.getDay()
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
        const timesheetData =
          response.data.timesheet_data || []
        const currentWeekData =
          timesheetData.filter((record) => {
            const recordDate = new Date(
              record.date
            )
            return (
              recordDate >= startOfWeek &&
              recordDate <= currentDate
            )
          })

        const workedHoursArray = fillMissingDays(
          currentWeekData,
          startOfWeek,
          currentDate
        )
        if (timesheetData.length > 0) {
          setChartData(workedHoursArray)
        }
      })
      .catch(() => {
        toast.error("Error fetching data")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const fillMissingDays = (
    data,
    startOfWeek,
    endOfWeek
  ) => {
    const daysOfWeek = [
      t("Sun"),
      t("Mon"),
      t("Tue"),
      t("Wed"),
      t("Thu"),
      t("Fri"),
      t("Sat"),
    ]
    const filledData = Array(5).fill(0)

    data.forEach((record) => {
      const recordDate = new Date(record.date)
      const dayIndex = daysOfWeek.indexOf(
        daysOfWeek[recordDate.getDay()]
      )
      if (
        recordDate >= startOfWeek &&
        recordDate <= endOfWeek
      ) {
        filledData[dayIndex - 1] =
          record.worked_hours || 0
      }
    })

    return filledData
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
          stepSize: 1,
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
        backgroundColor: "rgba(255, 99, 132, 1)",
      },
    ],
  }

  return chartData.length > 0 ? (
    <Box className="h-[34vh] m-auto dark:bg-gray-800 p-4 rounded-lg">
      <Bar
        options={options}
        data={data}
        className="min-w-[100%] min-h-[100%]"
      />
    </Box>
  ) : (
    <Box className="flex justify-center items-center h-[190px] dark:bg-gray-800 rounded-lg">
      {isLoading ? (
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
  )
}

export default CurrentWeekChart
