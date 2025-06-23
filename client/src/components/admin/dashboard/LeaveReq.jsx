import { Box, Text } from "@radix-ui/themes"
import { Bar } from "react-chartjs-2"
import React, { useEffect, useState } from "react"
import axios from "axios"
import { FadeLoader } from "react-spinners"
import { useOrganizationContext } from "../../OrganizationContext"

function BarChart() {
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({})
  const { organizationName, org_slug } =
    useOrganizationContext()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/leave_requests`,
          {
            params: {
              organization_name: organizationName,
              org_slug: org_slug,
            },
          }
        )
        setFormData(response.data || {})
        setLoading(false)
      } catch (error) {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const months = Object.keys(formData).sort(
    (a, b) => new Date(a) - new Date(b)
  )
  const acceptedData = months.map(
    (month) => formData[month].accepted
  )
  const rejectedData = months.map(
    (month) => formData[month].rejected
  )
  const inreviewData = months.map(
    (month) => formData[month].inreview
  )

  const isNoData =
    acceptedData.every((count) => count === 0) &&
    rejectedData.every((count) => count === 0) &&
    inreviewData.every((count) => count === 0)

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          boxWidth: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label =
              context.dataset.label || ""
            if (label) {
              label += ": "
            }
            if (context.parsed.y !== null) {
              label += Math.round(
                context.parsed.y
              )
            }
            return label
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Months",
          font: {
            weight: "bold",
            size: 15,
          },
          color: "black",
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: "Number of Requests",
          font: {
            weight: "bold",
            size: 15,
          },
          color: "black",
        },
        ticks: {
          stepSize: 1,
        },
        grid: {
          display: false,
        },
      },
    },
  }

  const labels = months

  const data = {
    labels,
    datasets: [
      {
        label: "Accepted",
        data: acceptedData.map((count) =>
          count === 0 ? 0.1 : count
        ),
        backgroundColor: "rgba(53, 162, 235, 1)",
      },
      {
        label: "Rejected",
        data: rejectedData.map((count) =>
          count === 0 ? 0.1 : count
        ),
        backgroundColor: "rgba(255, 99, 132, 1)",
      },
      {
        label: "In Review",
        data: inreviewData.map((count) =>
          count === 0 ? 0.1 : count
        ),
        backgroundColor: "rgba(255, 206, 86, 1)",
      },
    ],
  }

  return (
    <Box className="relative flex flex-col rounded-[0.4rem] lg:h-[64vh] xl:h-[64vh] 2xl:h-[64vh] 3xl:h-screen bg-base-100 dark:bg-gray-800 dark:text-white shadow-md transition-colors duration-200">
      <Box className="mt-5 ml-5">
        <Text className="align-left font-medium sm:text-sm md:text-lg lg:text-2xl text-black dark:text-white">
          Leave Request Chart
        </Text>
      </Box>
      <Box className="divider my-1 mx-2"></Box>
      <Box className="w-[98%] h-[50vh]  m-auto">
        {loading ? (
          <Box className="flex justify-center items-center h-full">
            <FadeLoader color="#2563eb" />
          </Box>
        ) : !isNoData ? (
          <Bar
            options={options}
            data={data}
          />
        ) : (
          <Text className="flex justify-center items-center py-36 text-gray-600 dark:text-white text-2xl">
            No data available
          </Text>
        )}
      </Box>
    </Box>
  )
}
export default BarChart
