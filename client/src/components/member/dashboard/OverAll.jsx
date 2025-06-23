import React, { useState, useEffect } from "react"
import axios from "axios"
import { Box } from "@radix-ui/themes"
import { useTranslation } from "react-i18next"
import toast from "react-hot-toast"
import FadeLoader from "react-spinners/FadeLoader"
import { useUser } from "@clerk/clerk-react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js"
import { Line } from "react-chartjs-2"
import { useOrganizationContext } from "../../OrganizationContext"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
)

function OverAllWeeksChart() {
  const [chartData, setChartData] = useState([])
  const { user } = useUser()
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const { t } = useTranslation()
  const { organizationName, org_slug } =
    useOrganizationContext()
  const [loading, setLoading] = useState(true)
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
    const fetchDataFromBackend = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/timesheetdata/${user.id}`,
          {
            params: {
              organization_name: organizationName,
              org_slug: org_slug,
            },
          }
        )
        const timesheetData =
          response.data.timesheet_data
        if (timesheetData.length > 0) {
          const processedData =
            processDataByMonth(timesheetData)
          setChartData(processedData)
        } else {
          setChartData([])
          setLoading(false)
        }
      } catch (error) {
        toast.error("Error fetching data")
        setChartData([])
        setLoading(false)
      }
    }
    fetchDataFromBackend()
  }, [])

  const calculateWeeklyTotals = (monthData) => {
    const weeklyTotals = [0, 0, 0, 0, 0]
    monthData.forEach((entry) => {
      const date = new Date(entry.date)
      const weekNumber = Math.ceil(
        date.getDate() / 7
      )
      const weeklyIndex = weekNumber - 1

      if (!isNaN(entry.worked_hours)) {
        const roundedHours = Math.ceil(
          entry.worked_hours
        )
        weeklyTotals[weeklyIndex] += roundedHours
      }
    })
    return weeklyTotals
  }

  const processDataByMonth = (data) => {
    const monthMap = {}
    data.forEach((entry) => {
      const date = new Date(entry.date)
      const monthYearKey = `${date.getMonth() + 1}-${date.getFullYear()}`
      if (!monthMap[monthYearKey]) {
        monthMap[monthYearKey] = []
      }
      monthMap[monthYearKey].push(entry)
    })

    const chartData = []
    for (const [
      monthKey,
      monthData,
    ] of Object.entries(monthMap)) {
      const [month, year] = monthKey.split("-")
      const weeklyTotals =
        calculateWeeklyTotals(monthData)

      const weeksData = {}
      weeklyTotals.forEach(
        (totalHours, index) => {
          weeksData[`Week ${index + 1}`] =
            totalHours
        }
      )

      chartData.push({
        month: `${month}-${year}`,
        ...weeksData,
      })
    }
    return chartData
  }

  const monthTickFormatter = (value) => {
    const [month, year] = value.split("-")
    const monthNames = [
      t("Jan"),
      t("Feb"),
      t("Mar"),
      t("Apr"),
      t("May"),
      t("Jun"),
      t("Jul"),
      t("Aug"),
      t("Sep"),
      t("Oct"),
      t("Nov"),
      t("Dec"),
    ]
    return `${monthNames[parseInt(month) - 1]}, ${year}`
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 15,
          color:
            currentTheme === "dark"
              ? "#e5e7eb"
              : undefined,
        },
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
          text: t("Months"),
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
          text: t("hrsPerWeek"),
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

  const labels = chartData.map((data) =>
    monthTickFormatter(data.month)
  )

  const data = {
    labels,
    datasets: [
      {
        label: t("week") + " 1",
        data: chartData.map(
          (data) => data["Week 1"]
        ),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor:
          "rgba(53, 162, 235, 0.5)",
      },
      {
        label: t("week") + " 2",
        data: chartData.map(
          (data) => data["Week 2"]
        ),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor:
          "rgba(255, 99, 132, 0.5)",
      },
      {
        label: t("week") + " 3",
        data: chartData.map(
          (data) => data["Week 3"]
        ),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor:
          "rgba(75, 192, 192, 0.5)",
      },
      {
        label: t("week") + " 4",
        data: chartData.map(
          (data) => data["Week 4"]
        ),
        borderColor: "rgb(255, 159, 64)",
        backgroundColor:
          "rgba(255, 159, 64, 0.5)",
      },
      {
        label: t("week") + " 5",
        data: chartData.map(
          (data) => data["Week 5"]
        ),
        borderColor: "rgb(255, 205, 86)",
        backgroundColor:
          "rgba(255, 205, 86, 0.5)",
      },
    ],
  }
  return (
    <>
      {chartData.length > 0 ? (
        <Box className="h-[34vh] m-auto dark:bg-gray-800 p-4 rounded-lg">
          <Line
            data={data}
            options={options}
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

export default OverAllWeeksChart
