import React, { useState, useEffect } from "react"
import {
  Flex,
  Table,
  Dialog,
  Button,
  Box,
} from "@radix-ui/themes"
import { RxCrossCircled } from "react-icons/rx"
import * as Form from "@radix-ui/react-form"
import axios from "axios"
import toast from "react-hot-toast"
import ModernPagination from "../ModernPagination"
import SearchBox from ".././SearchBox"
import { FadeLoader } from "react-spinners"
import { useOrganizationContext } from "../OrganizationContext"
const BASE_URL = process.env.REACT_APP_BASE_URL

function Department() {
  const [employeeData, setEmployeeData] =
    useState([])
  const [filteredMember, setFilteredMember] =
    useState([])
  const [designation, setDesignation] =
    useState("")
  const [role, setRole] = useState("")
  const [department, setDepartment] = useState("")
  const [ctc, setCtc] = useState("")
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState(false)
  const [currentPage, setCurrentPage] =
    useState(0)
  const [editData, setEditData] = useState({})
  const [searchVal, setSearchVal] = useState("")
  const [loading, setLoading] = useState(true)
  const itemsPerPage = 9
  const [
    departmentOptions,
    setDepartmentOptions,
  ] = useState([])
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
          const departments = backend.map(
            (department) =>
              department.department_name
          )
          setDepartmentOptions(departments)
        } else {
          setDepartmentOptions([])
        }
      })
      .catch(() => {
        toast.error("Error fetching data")
      })
  }
  const fetchDetails = (index) => {
    fetchData()
    axios
      .get(`${BASE_URL}/get_user_info`, {
        params: {
          organization_name: organizationName,
          org_slug: org_slug,
        },
      })
      .then((response) => {
        setEmployeeData(response.data.users_info)
        setFilteredMember(
          response.data.users_info
        )
        setLoading(false)
        if (response.data.users_info.length > 0) {
          const firstEmployee =
            response.data.users_info[
              index + currentPage * itemsPerPage
            ]
          setRole(firstEmployee.role || "")
          setDesignation(
            firstEmployee.designation || ""
          )
          setDepartment(
            firstEmployee.department || ""
          )
          setCtc(firstEmployee.ctc || "")
        }
      })
      .catch(() => {
        toast.error(
          "Error fetching leave request details"
        )
      })
  }

  const handleSearchFilter = (val) => {
    setSearchVal(val)
    if (val === "") {
      setFilter(false)
    } else {
      if (
        totalPages <= currentPage &&
        totalPages > 0
      ) {
        setCurrentPage(totalPages - 1)
      }
      setFilter(true)
    }
    const lowerCaseSearchVal = val.toLowerCase()
    setFilteredMember(
      employeeData.filter((data) => {
        return (
          (data.username &&
            data.username
              .toLowerCase()
              .includes(
                lowerCaseSearchVal.toLowerCase()
              )) ||
          (data.Gender &&
            data.Gender.toLowerCase() ===
              lowerCaseSearchVal.toLowerCase()) ||
          (data.DateOfJoining &&
            data.DateOfJoining.toLowerCase().includes(
              lowerCaseSearchVal.toLowerCase()
            )) ||
          (data.ContactNo &&
            data.ContactNo.toLowerCase().includes(
              lowerCaseSearchVal.toLowerCase()
            ))
        )
      })
    )
  }

  useEffect(() => {
    if (!open && !filter) {
      fetchDetails(0)
    }
    handleSearchFilter(searchVal)
  }, [searchVal])

  const onSubmit = (index) => {
    const selectedEmployee =
      filteredMember[
        index + currentPage * itemsPerPage
      ]

    const updatedEmployeeData = {
      designation: designation,
      role: role,
      department: department,
      ctc: ctc,
    }

    const user_id = selectedEmployee._id

    axios
      .put(
        `${BASE_URL}/update_user_informations/${user_id}`,
        updatedEmployeeData,
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )
      .then((response) => {
        toast.success("Data updated successfully")
        if (response.data && response.data._id) {
          const updatedData = [...filteredMember]
          updatedData[index] = response.data
          setEmployeeData(updatedData)
          setFilteredMember(updatedData)
          setLoading(false)
        }
      })
      .catch(() => {
        toast.error(
          "Please fill the organization's CEO details"
        )
        setLoading(false)
      })
  }
  const totalPages = Math.ceil(
    filteredMember.length / itemsPerPage
  )
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected)
  }

  const offset = currentPage * itemsPerPage
  const paginatedData = filteredMember.slice(
    offset,
    offset + itemsPerPage
  )

  return (
    <Box>
      <Box className="flex w-full box-border rounded-lg justify-between items-center">
        <SearchBox
          placeholder="Search Employee"
          searchValue={searchVal}
          handleOnchange={handleSearchFilter}
        />
      </Box>
      <Box className="min-h-[82vh] relative flex flex-col rounded-[0.4rem] bg-base-100 dark:bg-gray-800 shadow-md mt-3 h-full border border-gray-300 dark:border-gray-600">
        <Box className="ml-0 sm:ml-1 md:ml-1 lg:ml-2 px-0 sm:px-1 md:px-2 lg:px-4 lg:py-2 mr-0 sm:mr-0 md:mr-1 lg:mr-2">
          <Flex
            direction="column"
            gap="10px"
          >
            {loading ? (
              <Box className="flex justify-center items-center py-60">
                <FadeLoader color="#2563eb" />
              </Box>
            ) : employeeData.length === 0 ? (
              <Box className="text-center text-gray-600 dark:text-white mt-[20%] mb-[26%] text-3xl">
                Currently there is no Member
                Information .
              </Box>
            ) : (
              <Box className="h-[70vh] sm:h-[75vh] md:h-[62vh] lg:h-[66vh]">
                <Table.Root className="my-1 sm:my-1 md:my-3 lg:my-3 p-1 lg:p-2 md:p-2 sm:p-1 mx-0 sm:mx-1 md:mx-2 lg:mx-2 rounded-lg">
                  <Table.Header>
                    <Table.Row className="text-center font-semibold text-sm sm:text-sm md:text-base lg:text-base dark:text-white">
                      {[
                        "Name",
                        "Email",
                        "Gender",
                        "Joining Date",
                        "Contact No",
                        "Actions",
                      ].map(
                        (columnHeader, index) => (
                          <Table.ColumnHeaderCell
                            key={index}
                          >
                            {columnHeader}
                          </Table.ColumnHeaderCell>
                        )
                      )}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {paginatedData.map(
                      (request, index) => (
                        <Table.Row
                          key={index}
                          className="text-center font-medium text-xs sm:text-xs md:text-sm lg:text-sm dark:text-white"
                        >
                          <Table.RowHeaderCell>
                            {request.username}
                          </Table.RowHeaderCell>
                          <Table.Cell>
                            {request.email
                              ? request.email
                              : "---"}
                          </Table.Cell>
                          <Table.Cell>
                            {request.Gender
                              ? request.Gender
                              : "---"}
                          </Table.Cell>
                          <Table.Cell>
                            {request.DateOfJoining
                              ? request.DateOfJoining
                              : "---"}
                          </Table.Cell>
                          <Table.Cell>
                            {request.ContactNo
                              ? request.ContactNo
                              : "---"}
                          </Table.Cell>

                          <Table.Cell>
                            <Dialog.Root
                              onOpenChange={
                                setOpen
                              }
                            >
                              <Dialog.Trigger>
                                <Box>
                                  <Button
                                    size="1"
                                    className="cursor-pointer"
                                    onClick={() => {
                                      fetchDetails(
                                        index
                                      )
                                      setEditData(
                                        {
                                          ...request,
                                          index:
                                            index,
                                        }
                                      )
                                    }}
                                  >
                                    Edit Details
                                  </Button>
                                </Box>
                              </Dialog.Trigger>

                              <Dialog.Content
                                style={{
                                  maxWidth: 460,
                                }}
                                className="flex flex-col items-start position: relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4"
                              >
                                <Dialog.Close
                                  asChild
                                >
                                  <RxCrossCircled
                                    size="1.5em"
                                    className="crosscircleclose text-gray-600 dark:text-white"
                                  />
                                </Dialog.Close>
                                <Dialog.Title className="dark:text-white">
                                  Employee Data
                                </Dialog.Title>
                                <Flex
                                  direction="column"
                                  gap="3"
                                  className="flex flex-col w-full"
                                >
                                  <Form.Root className="text-base">
                                    <Form.Field className="flex items-center mb-1 text-black dark:text-white">
                                      <Form.Label className="font-bold mr-7">
                                        Name:
                                      </Form.Label>
                                      <Form.Control
                                        asChild
                                      >
                                        <Flex className="text-center ml-20">
                                          {
                                            editData.username
                                          }
                                        </Flex>
                                      </Form.Control>
                                    </Form.Field>
                                    <Form.Field className="flex items-center mb-1 text-black dark:text-white">
                                      <Form.Label className="font-bold mr-5">
                                        Gender:
                                      </Form.Label>
                                      <Form.Control
                                        asChild
                                      >
                                        <Flex className="text-center ml-20">
                                          {editData.Gender
                                            ? editData.Gender
                                            : "---"}
                                        </Flex>
                                      </Form.Control>
                                    </Form.Field>
                                    <Form.Field className="flex items-center mb-1 text-black dark:text-white">
                                      <Form.Label className="font-bold mr-5">
                                        Contact
                                        No:
                                      </Form.Label>
                                      <Form.Control
                                        asChild
                                      >
                                        <Flex className="text-center ml-12">
                                          {editData.ContactNo
                                            ? editData.ContactNo
                                            : "---"}
                                        </Flex>
                                      </Form.Control>
                                    </Form.Field>
                                    <Form.Field className="text-black dark:text-white">
                                      <Form.Label className="flex  justify-between w-full mb-2">
                                        <Flex className="font-bold mr-1">
                                          Role :
                                        </Flex>
                                        <Flex className="flex-grow text-center ml-28">
                                          <select
                                            onChange={(
                                              event
                                            ) =>
                                              setRole(
                                                event
                                                  .target
                                                  .value
                                              )
                                            }
                                            value={
                                              role
                                            }
                                            className="w-48 border border-black"
                                          >
                                            {role ? (
                                              <>
                                                <option value="CEO">
                                                  CEO
                                                </option>
                                                <option value="Manager">
                                                  Manager
                                                </option>
                                                <option value="Employee">
                                                  Employee
                                                </option>
                                              </>
                                            ) : (
                                              <>
                                                <option
                                                  value=""
                                                  disabled
                                                >
                                                  choose
                                                  your
                                                  role
                                                </option>
                                                <option value="CEO">
                                                  CEO
                                                </option>
                                                <option value="Manager">
                                                  Manager
                                                </option>
                                                <option value="Employee">
                                                  Employee
                                                </option>
                                              </>
                                            )}
                                          </select>
                                        </Flex>
                                      </Form.Label>
                                    </Form.Field>
                                    <Form.Field>
                                      <Form.Label className="flex justify-between w-full mb-2 text-black dark:text-white">
                                        <Flex className="font-bold">
                                          Department
                                          :
                                        </Flex>
                                        <Flex className="flex-grow text-center ml-14">
                                          <select
                                            onChange={(
                                              event
                                            ) =>
                                              setDepartment(
                                                event
                                                  .target
                                                  .value
                                              )
                                            }
                                            value={
                                              department
                                            }
                                            className="w-48 border border-black"
                                          >
                                            <option
                                              value=""
                                              disabled
                                            >
                                              Choose
                                              Department
                                            </option>
                                            {departmentOptions.map(
                                              (
                                                option
                                              ) => (
                                                <option
                                                  key={
                                                    option
                                                  }
                                                  value={
                                                    option
                                                  }
                                                >
                                                  {
                                                    option
                                                  }
                                                </option>
                                              )
                                            )}
                                          </select>
                                        </Flex>
                                      </Form.Label>
                                    </Form.Field>
                                    <Form.Field>
                                      <Form.Label className="flex justify-between w-full mb-2 text-black dark:text-white">
                                        <Flex className="font-bold">
                                          Designation
                                          :
                                        </Flex>
                                        <Flex className="flex-grow text-center ml-14">
                                          <select
                                            onChange={(
                                              event
                                            ) =>
                                              setDesignation(
                                                event
                                                  .target
                                                  .value
                                              )
                                            }
                                            value={
                                              designation
                                            }
                                            className="w-48 border border-black"
                                          >
                                            {designation ? (
                                              <>
                                                <option value="Jr. Software developer">
                                                  Jr.
                                                  Software
                                                  developer
                                                </option>
                                                <option value="Sr. Software developer">
                                                  Sr.
                                                  Software
                                                  developer
                                                </option>
                                              </>
                                            ) : (
                                              <>
                                                <option
                                                  value=""
                                                  disabled
                                                >
                                                  choose
                                                  Designation
                                                </option>
                                                <option value="Jr. Software developer">
                                                  Jr.
                                                  Software
                                                  developer
                                                </option>
                                                <option value="Sr. Software developer">
                                                  Sr.
                                                  Software
                                                  developer
                                                </option>
                                              </>
                                            )}
                                          </select>
                                        </Flex>
                                      </Form.Label>
                                    </Form.Field>
                                    <Form.Field className="flex items-center mb-1 text-black dark:text-white">
                                      <Form.Label className="font-bold mr-3">
                                        CTC:
                                      </Form.Label>
                                      <Form.Control
                                        asChild
                                      >
                                        <input
                                          type="number"
                                          className="w-48 border border-black ml-28"
                                          onChange={(
                                            event
                                          ) =>
                                            setCtc(
                                              event
                                                .target
                                                .value
                                            )
                                          }
                                          value={
                                            ctc
                                          }
                                          required
                                          name="ctc"
                                          placeholder=" Enter CTC"
                                        />
                                      </Form.Control>
                                    </Form.Field>
                                    <Dialog.Close>
                                      <Box className="flex justify-end">
                                        <Button
                                          type="button"
                                          onClick={() => {
                                            onSubmit(
                                              editData.index
                                            )
                                          }}
                                        >
                                          Save
                                        </Button>
                                      </Box>
                                    </Dialog.Close>
                                  </Form.Root>
                                </Flex>
                              </Dialog.Content>
                            </Dialog.Root>
                          </Table.Cell>
                        </Table.Row>
                      )
                    )}
                  </Table.Body>
                </Table.Root>
                {filteredMember.length > 9 && (
                  <Flex
                    justify="center"
                    className="absolute bottom-[2vh] transform translate-x-1/2 right-1/2"
                  >
                    <ModernPagination
                      total={
                        filteredMember.length
                      }
                      pageSize={itemsPerPage}
                      currentPage={currentPage}
                      onPageChange={
                        handlePageChange
                      }
                      showEdges={true}
                      siblingCount={1}
                      pageCount={totalPages}
                    />
                  </Flex>
                )}
              </Box>
            )}
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}
export default Department
