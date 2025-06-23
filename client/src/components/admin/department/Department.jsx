import React, { useState, useEffect } from "react"
import axios from "axios"
import {
  Table,
  Box,
  Flex,
  Button,
} from "@radix-ui/themes"
import Departmentform from "./Departmentform"
import FadeLoader from "react-spinners/FadeLoader"
import { MdOutlineCancel } from "react-icons/md"
import { RiDeleteBin6Line } from "react-icons/ri"
import { FaRegEdit } from "react-icons/fa"
import toast from "react-hot-toast"
import * as Dialog from "@radix-ui/react-dialog"
import ModernPagination from "../../ModernPagination"
import SearchBox from "../../SearchBox"

import { useOrganizationContext } from "../../OrganizationContext"
function Department() {
  const [departmentData, setDepartmentData] =
    useState([])
  const [
    filteredDepartment,
    setFilteredDepartment,
  ] = useState([])
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const [refresh, setRefresh] = useState(false)
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] =
    useState(0)
  const [editIndex, setEditIndex] = useState(-1)
  const itemsPerPage = 8
  const [editedRows, setEditedRows] = useState([])
  const totalPages = Math.ceil(
    filteredDepartment.length / itemsPerPage
  )
  const [searchVal, setSearchVal] = useState("")
  const [employeeData, setEmployeeData] =
    useState([])
  const { organizationName, org_slug } =
    useOrganizationContext()
  const fetchData = () => {
    axios
      .get(`${BASE_URL}/departmentinfo`, {
        params: {
          organization_name: organizationName,
          org_slug: org_slug,
        },
      })
      .then((response) => {
        if (response.data) {
          const backend =
            response.data.department_data
          setDepartmentData(backend)
          setFilteredDepartment(backend)
          if (
            backend.length <=
              itemsPerPage * currentPage &&
            currentPage > 0
          ) {
            setCurrentPage(currentPage - 1)
          }
        } else {
          setDepartmentData([])
          setFilteredDepartment([])
        }
        setLoading(false)
      })
      .catch(() => {
        toast.error("Error fetching data")
        setLoading(false)
      })
  }
  const fetchDetails = () => {
    axios
      .get(`${BASE_URL}/get_user_info`, {
        params: {
          organization_name: organizationName,
          org_slug: org_slug,
        },
      })
      .then((response) => {
        const usersInfo = response.data.users_info
        setLoading(false)
        const departmentCounts = {}
        usersInfo.forEach((employee) => {
          const department =
            employee.department || "Other"
          if (
            Object.prototype.hasOwnProperty.call(
              departmentCounts,
              department
            )
          ) {
            departmentCounts[department]++
          } else {
            departmentCounts[department] = 1
          }
        })
        setEmployeeData(departmentCounts)
      })
      .catch(() => {
        toast.error(
          "Error fetching leave request details"
        )
      })
  }

  useEffect(() => {
    fetchData()
    fetchDetails()
  }, [refresh])

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected)
  }

  const handleDelete = async (departmentName) => {
    try {
      await axios.delete(
        `${BASE_URL}/deletedepartments/${departmentName}`,
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )
      setRefresh(!refresh)
    } catch (error) {
      toast.error("Error deleting department")
      setRefresh(!refresh)
    }
  }

  const offset = currentPage * itemsPerPage
  const paginatedfilteredDepartment =
    filteredDepartment.slice(
      offset,
      offset + itemsPerPage
    )
  const handleEditClick = (index) => {
    setEditIndex(index)
    setEditedRows([...editedRows, index])

    axios
      .get(`${BASE_URL}/user_name`, {
        params: {
          organization_name: organizationName,
          org_slug: org_slug,
        },
      })
      .then((response) => {
        const backend = response.data
        const usernames = backend.usernames
        const managers = backend.managers

        const filteredUsernames =
          usernames.filter(
            (username) =>
              !managers.includes(username)
          )

        setManagers(filteredUsernames)
      })
      .catch(() => {
        toast.error("Error fetching data")
      })
  }

  const updateDepartmentDetails = (
    departmentName,
    newData
  ) => {
    axios
      .put(
        `${BASE_URL}/updatedepartments/${departmentName}`,
        newData,
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )
      .then(() => {
        setRefresh(!refresh)
        setEditIndex(-1)
      })
      .catch(() => {
        toast.error(
          "Error updating department details"
        )
      })
  }

  const handleSaveClick = (
    departmentName,
    newManagerName
  ) => {
    const updatedData = {
      manager: newManagerName,
    }
    updateDepartmentDetails(
      departmentName,
      updatedData
    )
  }
  const handleCancelClick = (index) => {
    setEditIndex(-1)
    setEditedRows(
      editedRows.filter(
        (rowIndex) => rowIndex !== index
      )
    )
    setRefresh(!refresh)
  }

  const handleManagerChange = (
    event,
    departmentName,
    index
  ) => {
    const newManagerName = event.target.value
    const newData = [...filteredDepartment]
    newData[
      index + currentPage * itemsPerPage
    ].manager = newManagerName
    setDepartmentData(newData)
  }

  const handleSearchFilter = (val) => {
    setSearchVal(val)
    const lowerCaseSearchVal = val.toLowerCase()
    if (
      totalPages <= currentPage &&
      totalPages > 0
    ) {
      setCurrentPage(0)
    }
    setFilteredDepartment(
      departmentData.filter((data) => {
        return (
          data.department_name
            .toLowerCase()
            .includes(lowerCaseSearchVal) ||
          data.manager
            .toLowerCase()
            .includes(lowerCaseSearchVal) ||
          (employeeData[data.department_name]
            ? employeeData[data.department_name]
                .toString()
                .toLowerCase() ===
              lowerCaseSearchVal
            : lowerCaseSearchVal === "0")
        )
      })
    )
  }

  return (
    <Box>
      <Box className="mb-3 flex box-border rounded-lg justify-between items-center">
        <SearchBox
          placeholder="Search Department"
          searchValue={searchVal}
          handleOnchange={handleSearchFilter}
        />
        <Departmentform
          setRefresh={setRefresh}
          refresh={refresh}
        />
      </Box>
      <Box className="min-h-[82vh] relative flex flex-col rounded-[0.4rem] bg-base-100 dark:bg-gray-800 shadow-md border border-gray-300 dark:border-gray-600 transition-colors duration-200">
        <Box className="ml-0 sm:ml-1 md:ml-1 lg:ml-2 px-0 sm:px-1 md:px-2 lg:px-2 lg:py-2 mr-0 sm:mr-0 md:mr-1 lg:mr-2">
          <Box className="h-[62vh] mt-8 mx-5 text-xl">
            {loading ? (
              <Box className="h-[62vh]">
                <Box className="flex justify-center py-52">
                  <FadeLoader color="#2563eb" />
                </Box>
              </Box>
            ) : filteredDepartment.length ===
              0 ? (
              <Box className="h-[62vh]">
                <Box className="flex items-center justify-center h-full">
                  <Box className="text-center text-gray-600 dark:text-white text-lg">
                    Currently there is no
                    department data.
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box>
                <Table.Root className=" mx-0 sm:mx-1 md:mx-1 lg:mx-2">
                  <Table.Header>
                    <Table.Row className="text-center font-semibold text-sm sm:text-sm md:text-base lg:text-base text-black dark:text-white">
                      {[
                        "Department Name",
                        "Manager Name",
                        "Number of Employees",
                        "Actions",
                      ].map((label, index) => (
                        <Table.Cell
                          key={index}
                          className="w-1/4"
                        >
                          {label}
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {paginatedfilteredDepartment.map(
                      (data, index) => (
                        <Table.Row
                          key={index}
                          className="text-center font-medium text-xs sm:text-xs md:text-sm lg:text-sm text-black dark:text-white"
                        >
                          <Table.Cell className="w-1/4">
                            <Box
                              height="5"
                              className="flex items-center justify-center"
                            >
                              <Box>
                                {
                                  data.department_name
                                }
                              </Box>
                            </Box>
                          </Table.Cell>
                          <Table.Cell className="w-1/4">
                            <Box
                              height="5"
                              className="flex items-center justify-center"
                            >
                              {editIndex ===
                              index ? (
                                <Flex className="items-center justify-center">
                                  <select
                                    onChange={(
                                      event
                                    ) =>
                                      handleManagerChange(
                                        event,
                                        data.department_name,
                                        index
                                      )
                                    }
                                    className={`border ${editIndex === index ? "border-black" : "border-transparent"} rounded px-2 py-1`}
                                  >
                                    <option value="">
                                      Edit Manager
                                    </option>
                                    {managers.map(
                                      (
                                        manager,
                                        index
                                      ) => (
                                        <option
                                          key={
                                            index
                                          }
                                          value={
                                            manager
                                          }
                                        >
                                          {
                                            manager
                                          }
                                        </option>
                                      )
                                    )}
                                  </select>
                                </Flex>
                              ) : (
                                <Box>
                                  {data.manager}
                                </Box>
                              )}
                            </Box>
                          </Table.Cell>
                          <Table.Cell className="w-1/4">
                            <Box
                              height="5"
                              className="flex items-center justify-center"
                            >
                              {employeeData[
                                data
                                  .department_name
                              ] || 0}
                            </Box>
                          </Table.Cell>
                          <Table.Cell className="w-1/4">
                            <Box
                              height="5"
                              className="flex items-center justify-center"
                            >
                              <Flex
                                align="center"
                                gap="3"
                              >
                                {editIndex ===
                                index ? (
                                  <Flex className="space-x-2 items-center justify-self-end justify-center cursor-pointer">
                                    <Button
                                      variant="solid"
                                      onClick={() =>
                                        handleSaveClick(
                                          data.department_name,
                                          data.manager
                                        )
                                      }
                                      className="w-20"
                                    >
                                      Save
                                    </Button>
                                    <MdOutlineCancel
                                      onClick={() =>
                                        handleCancelClick(
                                          index
                                        )
                                      }
                                      size="25"
                                      color="dimgray dark:text-white"
                                    />
                                  </Flex>
                                ) : (
                                  <FaRegEdit
                                    onClick={() =>
                                      handleEditClick(
                                        index
                                      )
                                    }
                                    color="#818cf8"
                                    size="22"
                                    className="cursor-pointer"
                                    title="Edit"
                                  />
                                )}
                                <Dialog.Root>
                                  <Dialog.Trigger>
                                    <RiDeleteBin6Line
                                      size="22"
                                      color="dimgray dark:text-white"
                                      className="cursor-pointer"
                                      title="Delete"
                                    />
                                  </Dialog.Trigger>
                                  <Dialog.Portal>
                                    <Dialog.Overlay className="AlertDialogOverlay" />
                                    <Dialog.Content className="AlertDialogContent bg-white dark:bg-gray-800">
                                      <Dialog.Title className="AlertDialogTitle text-black dark:text-white">
                                        Confirm
                                        Delete?
                                      </Dialog.Title>
                                      <Dialog.Description className="AlertDialogDescription text-black dark:text-white">
                                        Are you
                                        sure to
                                        delete the
                                        Department?
                                      </Dialog.Description>
                                      <Flex
                                        className="gap-2"
                                        style={{
                                          justifyContent:
                                            "flex-end",
                                        }}
                                      >
                                        <Dialog.Close>
                                          <Button
                                            variant="soft"
                                            color="red"
                                            style={{
                                              padding:
                                                "0.3rem 0.8rem",
                                              borderRadius:
                                                "0.375rem",
                                            }}
                                            className="px-2 py-1 bg-red-50 hover:bg-red-100 rounded-md text-red-600 dark:text-white dark:bg-red-700"
                                          >
                                            Cancel
                                          </Button>
                                        </Dialog.Close>
                                        <Dialog.Close>
                                          <Button
                                            variant="solid"
                                            color="indigo"
                                            style={{
                                              padding:
                                                "0.3rem 0.8rem",
                                              borderRadius:
                                                "0.375rem",
                                            }}
                                            onClick={() =>
                                              handleDelete(
                                                data.department_name
                                              )
                                            }
                                          >
                                            Delete
                                          </Button>
                                        </Dialog.Close>
                                      </Flex>
                                    </Dialog.Content>
                                  </Dialog.Portal>
                                </Dialog.Root>
                              </Flex>
                            </Box>
                          </Table.Cell>
                        </Table.Row>
                      )
                    )}
                  </Table.Body>
                </Table.Root>
              </Box>
            )}
          </Box>
          {filteredDepartment.length > 8 && (
            <Flex
              justify="center"
              className="absolute bottom-[2vh] left-1/2 transform -translate-x-1/2"
            >
              <ModernPagination
                total={filteredDepartment.length}
                pageSize={7}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                showEdges={true}
              />
            </Flex>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default Department
