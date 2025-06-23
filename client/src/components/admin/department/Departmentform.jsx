import React, { useState, useEffect } from "react"
import {
  Box,
  DialogClose,
  Button,
  Flex,
} from "@radix-ui/themes"
import * as Form from "@radix-ui/react-form"
import axios from "axios"
import { Dialog, Text } from "@radix-ui/themes"
import toast from "react-hot-toast"
import { useOrganizationContext } from "../../OrganizationContext"
import PropTypes from "prop-types"

function Departmentform(props) {
  const [nameExists, setNameExists] =
    useState(false)
  const [namemsg, setNamemsg] = useState("")
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const [formData, setFormData] = useState([])
  const [data, setData] = useState([])

  const [departmentData, setdepartmentData] =
    useState({
      department_name: "",
      manager: "",
      user_id: "",
    })
  const { organizationName, org_slug } =
    useOrganizationContext()

  const storeData = (e) => {
    const { name, value } = e.target
    setdepartmentData({
      ...departmentData,
      [name]: value,
    })
  }
  useEffect(() => {
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
        setData(backend.alldata)
        const filteredUsernames =
          usernames.filter(
            (username) =>
              !managers.includes(username)
          )
        setFormData(filteredUsernames)
      })
      .catch(() => {
        toast.error("Error fetching data")
      })
  }, [props.refresh])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (departmentData.manager === "") {
      return
    }
    const selectedManager = data.find(
      (data) =>
        data.username === departmentData.manager
    )
    if (
      selectedManager &&
      selectedManager.user_id
    ) {
      const dataToSend = {
        ...departmentData,
        user_id: selectedManager.user_id,
        org_slug: org_slug,
      }
      axios
        .post(
          `${BASE_URL}/department`,
          { ...dataToSend },
          {
            params: {
              organization_name: organizationName,
              org_slug: org_slug,
            },
          }
        )
        .then(() => {
          props.setRefresh(!props.refresh)
        })
        .catch(() => {
          toast.error(
            "Error sending user details"
          )
        })
    } else {
      toast.error(
        "Selected manager not found or does not have a user_id"
      )
    }
  }

  const handleCancel = () => {
    setNameExists(false)
    setNamemsg("")
    props.setRefresh(!props.refresh)
  }

  const checkDepartmentName = async (
    departmentName
  ) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/departmentinfo`,
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )
      const departmentData =
        response.data.department_data
      const nameExists = departmentData.some(
        (department) =>
          department.department_name ===
          departmentName
      )
      setNameExists(nameExists)
    } catch (error) {
      toast.error(
        "Error checking department name"
      )
    }
  }
  const handleDepartmentNameChange = (e) => {
    const departmentName = e.target.value
    setdepartmentData({
      ...departmentData,
      department_name: departmentName,
    })
    const isNotAlphabet = /[^A-Za-z ]/.test(
      departmentName
    )

    if (isNotAlphabet) {
      setNamemsg("Please enter alphabets only")
    } else if (
      !/^[A-Z][A-Za-z ]*$/.test(departmentName)
    ) {
      setNamemsg(
        "Please enter the Department Name with the first letter capitalized"
      )
    } else {
      setNamemsg("")
    }
    checkDepartmentName(departmentName)
  }

  const handleManagerChange = (e) => {
    const manager = e.target.value
    setdepartmentData({
      ...departmentData,
      manager: manager,
    })
  }

  const isSubmitDisabled = () => {
    return (
      nameExists ||
      !departmentData.department_name ||
      !/^[A-Z][A-Za-z ]*$/.test(
        departmentData.department_name
      ) ||
      !departmentData.manager
    )
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger
        asChild
        className="justify-center ml-10"
      >
        <Button
          size="2"
          variant="solid"
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded h-10"
        >
          Add Department
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="data-[state=open]:animate-contentShow max-h-[90vh] w-[90vw] max-w-[400px] sm:w-[90vw] sm:max-w-[600px] rounded-[6px] bg-white dark:bg-gray-800 p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none position: relative">
        <Dialog.Title className="text-mauve12 m-0 text-[17px] ">
          <Text className=" mb-2 items-center ml-10 text-black dark:text-white">
            Department Form
          </Text>
        </Dialog.Title>
        <Flex className="flex justify-center">
          <Box className="justify-center mt-1 w-full max-h-[80vh]">
            <Box className="max-h-full overflow-y-auto overflow-y-auto h-full">
              {" "}
              <Form.Root onSubmit={handleSubmit}>
                <Box>
                  <Form.Field
                    className="grid mb-4"
                    name="department_name"
                  >
                    <Box>
                      <Form.Label className="block mb-1 font-medium text-black dark:text-white">
                        Department Name
                      </Form.Label>
                    </Box>
                    <Form.Message
                      className="text-[13px] text-red-500 opacity-[0.8]"
                      match="valueMissing"
                    >
                      Please enter Department Name
                    </Form.Message>
                    <Box>
                      <Form.Control asChild>
                        <input
                          type="text"
                          className="w-full p-2 dark:text-white border border-gray-300 rounded mt-1 focus:outline-none focus:border-blue-500"
                          onChange={
                            handleDepartmentNameChange
                          }
                          required
                          name="department_name"
                          placeholder="Please enter department name"
                        />
                      </Form.Control>
                      {departmentData.department_name &&
                        !/^[A-Z][A-Za-z ]+$/.test(
                          departmentData.department_name
                        ) && (
                          <Box className="text-red-500 text-sm">
                            {namemsg}
                          </Box>
                        )}
                    </Box>
                    {nameExists && (
                      <Form.Message className="text-[13px] text-red-500 opacity-[0.8]">
                        Department Name already
                        exists
                      </Form.Message>
                    )}
                  </Form.Field>
                </Box>
                <Box>
                  <Form.Field
                    className="grid mb-4"
                    onChange={storeData}
                  >
                    <Box name="manager">
                      <Form.Label className="mb-1 font-medium text-black dark:text-white">
                        Manager Name
                      </Form.Label>
                    </Box>
                    <Box>
                      <Form.Control asChild>
                        <select
                          name="manager"
                          id="manager"
                          onChange={
                            handleManagerChange
                          }
                          className="inline-flex text-black dark:text-white items-center justify-between w-full p-2 border border-gray-300 dark:border-gray-600 rounded mt-1 focus:outline-none focus:border-blue-500"
                          aria-label="Manager Names"
                          defaultValue=""
                        >
                          <option
                            value=""
                            disabled
                          >
                            Choose Manager
                          </option>
                          {formData.map(
                            (data, index) => (
                              <option
                                key={index}
                                value={data}
                              >
                                {data}
                              </option>
                            )
                          )}
                        </select>
                      </Form.Control>
                    </Box>
                  </Form.Field>
                </Box>
                <Flex
                  className="mb-3 mt-6 ml-[25vw]"
                  gap="2"
                >
                  <Dialog.Close>
                    <Button
                      variant="soft"
                      color="red"
                      className="px-2 py-1 bg-red-50 hover:bg-red-100 rounded-md text-red-600 dark:text-white dark:bg-red-700"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </Dialog.Close>

                  <DialogClose>
                    <Button
                      className={`bg-blue-500 dark:bg-blue-700 hover:bg-blue-800 dark:hover:bg-blue-800 text-white dark:text-white px-5 py-2.5 transition-colors duration-200 ease-out rounded items-center ${
                        isSubmitDisabled()
                          ? "bg-gray-400 text-white dark:text-white dark:text-gray-700 cursor-not-allowed"
                          : "hover:bg-indigo-700 dark:hover:bg-indigo-800"
                      }`}
                      type="submit"
                      disabled={isSubmitDisabled()}
                    >
                      Submit
                    </Button>
                  </DialogClose>
                </Flex>
              </Form.Root>
            </Box>
          </Box>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default Departmentform
Departmentform.propTypes = {
  refresh: PropTypes.bool,
  setRefresh: PropTypes.func,
}
