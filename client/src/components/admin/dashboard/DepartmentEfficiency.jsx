import { Box, Text } from "@radix-ui/themes"
import axios from "axios"
import { Bar } from "react-chartjs-2"
import React, { useState, useEffect } from "react"
import { FadeLoader } from "react-spinners"
import toast from "react-hot-toast"
import { useOrganizationContext } from "../../OrganizationContext"

function DepartmentEfficiency() {
  const [departmentData, setDepartmentData] =
    useState([])
  const [loading, setLoading] = useState(true)
  const { organizationName, org_slug } =
    useOrganizationContext()
  useEffect(() => {
    axios
      .get(
        `${process.env.REACT_APP_BASE_URL}/department_efficiency`,
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )
      .then((response) => response.data)
      .then((data) => {
        const departments = Object.keys(
          data.department_counts
        )
        const counts = Object.values(
          data.department_counts
        )
        const formattedData = departments.map(
          (department, index) => ({
            name: department,
            y: counts[index],
          })
        )
        setDepartmentData(formattedData)
        setLoading(false)
      })
      .catch(() => {
        toast.error(
          "Error fetching department efficiency data"
        )
        setLoading(false)
      })
  }, [])

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: "Departments",
          font: {
            weight: "bold",
            size: 15,
          },
          color: "black-100",
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: "Employees count",
          font: {
            weight: "bold",
            size: 15,
          },
          color: "black-100",
        },
        ticks: {
          stepSize: 1,
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  }

  const labels = departmentData.map(
    (department) => department.name
  )

  const dataLength = departmentData.length
  let barPercentage
  if (dataLength === 1) {
    barPercentage = 0.1
  } else if (dataLength === 2) {
    barPercentage = 0.2
  } else {
    barPercentage = 0.5 + 0.1 * (dataLength - 5)
    if (barPercentage > 1) barPercentage = 1
  }
  const colors = [
    "rgba(255, 99, 132, 1)",
    "rgba(54, 162, 235, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(153, 102, 255, 1)",
    "rgba(255, 159, 64, 1)",
    "rgba(255, 0, 255, 1)",
    "rgba(0, 255, 255, 1)",
    "rgba(128, 0, 128, 1)",
    "rgba(0, 128, 128, 1)",
    "rgba(128, 128, 0, 1)",
    "rgba(128, 128, 128, 1)",
    "rgba(0, 255, 0, 1)",
    "rgba(255, 0, 0, 1)",
    "rgba(0, 0, 255, 1)",
    "rgba(255, 255, 0, 1)",
    "rgba(0, 255, 255, 1)",
    "rgba(255, 0, 255, 1)",
    "rgba(192, 192, 192, 1)",
    "rgba(128, 0, 0, 1)",
  ]
  const data = {
    labels: labels,
    datasets: [
      {
        label: false,
        data: departmentData.map(
          (department) => department.y
        ),
        backgroundColor: colors.slice(
          0,
          departmentData.length
        ),
        barPercentage: barPercentage,
        categoryPercentage: 1,
      },
    ],
  }

  return (
    <Box className="relative flex flex-col rounded-[0.4rem] lg:h-[64vh] xl:h-[64vh] 2xl:h-[64vh] 3xl:h-screen bg-white dark:bg-gray-800 dark:text-white shadow-md transition-colors duration-200">
      <Box className="mt-5 ml-5">
        <Text className="align-left font-medium sm:text-sm md:text-lg lg:text-2xl ">
          Department Count
        </Text>
      </Box>
      <Box className="divider my-1 mx-2"></Box>
      <Box className="w-[98%] h-[50vh] m-auto">
        {loading ? (
          <Box className="flex justify-center items-center h-full">
            <FadeLoader color="#2563eb" />
          </Box>
        ) : departmentData.length > 0 ? (
          <Bar
            className="bg-white dark:bg-gray-800"
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
export default DepartmentEfficiency
