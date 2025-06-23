import React, { useState } from "react"
import {
  Dialog,
  Text,
  Box,
  Flex,
  Button,
  Badge,
} from "@radix-ui/themes"
import { RxCrossCircled } from "react-icons/rx"
import * as Label from "@radix-ui/react-label"
import { useTranslation } from "react-i18next"
import PropTypes from "prop-types"

const Leavehistoryfunction = (props) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [showConfirmation, setShowConfirmation] =
    useState(false)

  const handleViewPDF = (attachment) => {
    const pdfWindow = window.open()
    pdfWindow.document.write(
      `<iframe width='100%' height='100%' src='data:application/pdf;base64,${attachment}'></iframe>`
    )
  }

  const renderSpecification = () => {
    const {
      is_unplanned,
      start_date,
      end_date,
      leavedates,
    } = props.leave

    if (
      leavedates &&
      Object.keys(leavedates).length > 0
    ) {
      return Object.entries(leavedates).map(
        ([date, options]) => (
          <Box key={date}>
            <Box>
              {date} :{" "}
              {options["firstHalf"] ? (
                <>
                  First Half
                  {options["wfh"] &&
                    ", Second Half(WFH)"}
                  {options["useSwap"] &&
                    " (Swap used)"}
                </>
              ) : options["secondHalf"] ? (
                <>
                  Second Half
                  {options["wfh"] &&
                    ", First Half(WFH)"}
                  {options["useSwap"] &&
                    " (Swap used)"}
                </>
              ) : options["fullLeave"] ? (
                <>
                  Full Leave
                  {options["useSwap"] &&
                    " (Swap used)"}
                </>
              ) : options["wfh"] ? (
                <>WFH</>
              ) : (
                "No options selected"
              )}
            </Box>
          </Box>
        )
      )
    }

    if (is_unplanned) {
      return (
        <Box>
          <Box>
            {start_date} : Unplanned Leave
            (Default 1 Day)
          </Box>
        </Box>
      )
    }

    if (start_date === end_date) {
      return (
        <Box>
          <Box>
            {start_date} : Planned Single-Day
            Leave (Full Leave)
          </Box>
        </Box>
      )
    }

    return <Box>{t("noSpecification")}</Box>
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={setOpen}
    >
      <Dialog.Trigger asChild>
        <Box>
          <Button size="1">
            {t("viewDetails")}
          </Button>
        </Box>
      </Dialog.Trigger>
      <Dialog.Content
        style={{ maxWidth: 420 }}
        className="flex flex-col items-start p-4 bg-white dark:bg-gray-800 text-black dark:text-white relative"
      >
        <Dialog.Close asChild>
          <RxCrossCircled
            size="1.5em"
            className="crosscircleclose"
            color="#727171"
            onClick={() => setOpen(false)}
          />
        </Dialog.Close>
        <Dialog.Title
          size={"5"}
          className=" font-bold text-black dark:text-white"
        >
          {t("leaveDetailsTitle")}
        </Dialog.Title>
        <Dialog.Description
          mb="4"
          className="text-black dark:text-gray-300"
        >
          {" "}
          {t("viewLeaveDetails")}
        </Dialog.Description>
        <Flex
          direction="column"
          gap="3"
        >
          <Label.Root className="flex justify-between items-center w-full mb-2">
            <Text
              as="div"
              size="2"
              mb="1"
              weight="bold"
              className="text-black dark:text-white"
            >
              {t("startDate")} :
            </Text>
            <Box className="flex-grow ml-14 text-black dark:text-gray-300">
              {props.leave.start_date}
            </Box>
          </Label.Root>
          <Label.Root className="flex justify-between items-center w-full mb-2">
            <Text
              as="div"
              size="2"
              mb="1"
              weight="bold"
              className="text-black dark:text-white"
            >
              {t("endDate")} :
            </Text>
            <Box className="flex-grow ml-16 text-black dark:text-gray-300">
              {props.leave.end_date}
            </Box>
          </Label.Root>
          <Label.Root className="flex justify-between items-center w-full mb-2">
            <Text
              as="div"
              size="2"
              mb="1"
              weight="bold"
              className="text-black dark:text-white"
            >
              {t("leaveType")} :
            </Text>
            <Box className="flex-grow ml-8 text-black dark:text-gray-300">
              {props.leave.leave_type}
            </Box>
          </Label.Root>
          <Label.Root className="flex justify-between items-center w-full mb-2">
            <Text
              as="div"
              size="2"
              mb="1"
              weight="bold"
              className="text-black dark:text-white"
            >
              {t("status")} :
            </Text>
            <Box className="flex-grow ml-10 text-black dark:text-gray-300">
              <Flex
                gap="2"
                align="center"
              >
                <Badge
                  color={
                    props.leave.status ===
                    "accepted"
                      ? "green"
                      : props.leave.status ===
                          "pending"
                        ? "yellow"
                        : props.leave.status ===
                            "in_review"
                          ? "indigo"
                          : props.leave.status ===
                              "cancelled"
                            ? "gray"
                            : "red"
                  }
                  className="dark:text-white"
                >
                  {props.leave.status
                    .replace("_", " ")
                    .replace(/\w/, (c) =>
                      c.toUpperCase()
                    )}
                </Badge>
                {props.leave.auto_approved && (
                  <Badge
                    color="blue"
                    className="dark:text-white"
                  >
                    Auto
                  </Badge>
                )}
              </Flex>
            </Box>
          </Label.Root>
          <Label.Root className="flex justify-between items-center w-full mb-2">
            <Text
              as="div"
              size="2"
              mb="1"
              weight="bold"
              className="text-black dark:text-white"
            >
              Total Leaves :
            </Text>
            <Box className="flex-grow ml-12 text-black dark:text-gray-300">
              {props.leave.span}
            </Box>
          </Label.Root>
          <Label.Root className="flex justify-between items-center w-full mb-2">
            <Text
              as="div"
              size="2"
              mb="1"
              weight="bold"
              className="text-black dark:text-white"
            >
              Specification :
            </Text>
            <Box className="w-52 h-32 overflow-y-auto flex-grow ml-10 border border-gray-300 rounded p-2">
              {renderSpecification()}
            </Box>
          </Label.Root>
          <Label.Root className="flex justify-between items-center w-full mb-2">
            <Text
              as="div"
              size="2"
              mb="1"
              weight="bold"
              className="text-black dark:text-white"
            >
              {t("description")} :
            </Text>
            <Box
              className={
                props.leave.description
                  ? "w-52 h-32 overflow-y-auto flex-grow ml-10 border border-gray-300 rounded p-2"
                  : "flex-grow ml-12 text-black dark:text-gray-300"
              }
            >
              <Box>
                {props.leave.description ||
                  t("notMentioned")}
              </Box>
            </Box>
          </Label.Root>
          <Label.Root className="flex justify-between items-center w-full mb-2">
            <Text
              as="div"
              size="2"
              mb="1"
              weight="bold"
              className="text-black dark:text-white"
            >
              {t("attachment")}:
            </Text>
            <Box className="flex-grow ml-14 text-black dark:text-gray-300">
              <Flex>
                {props.leave.attachment ? (
                  <Box
                    className="text-blue-500 underline"
                    onClick={() => {
                      handleViewPDF(
                        props.leave.attachment
                      )
                    }}
                  >
                    {t("viewPDF")}
                  </Box>
                ) : (
                  t("notAttached")
                )}
              </Flex>
            </Box>
          </Label.Root>

          <Flex
            mb="2"
            justify="end"
          >
            {props.leave.status === "pending" && (
              <>
                <Button
                  color="red"
                  variant="soft"
                  disabled={
                    props.leave.is_notified
                  }
                  className="text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-800 dark:text-white rounded-md px-5 py-2.5 font-medium text-sm transition-all duration-200"
                  onClick={() =>
                    setShowConfirmation(true)
                  }
                >
                  Cancel Request
                </Button>
                {showConfirmation && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 pb-20">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[240px] mx-4 shadow-xl min-w-[120px] min-h-[120px] flex flex-col items-center justify-between gap-6 mb-4">
                      <Text className="text-base font-medium text-center text-black dark:text-white">
                        Are you sure?
                      </Text>
                      <Flex
                        gap="4"
                        justify="center"
                        width="100%"
                      >
                        <Button
                          variant="soft"
                          color="gray"
                          onClick={() =>
                            setShowConfirmation(
                              false
                            )
                          }
                          className="min-w-[80px] dark:bg-gray-300 dark:hover:bg-gray-400"
                        >
                          No
                        </Button>
                        <Button
                          variant="solid"
                          color="indigo"
                          onClick={() => {
                            props.updateUserStatus(
                              props.leave._id,
                              "cancelled"
                            )
                            setShowConfirmation(
                              false
                            )
                            setOpen(false)
                          }}
                          className="min-w-[80px]"
                        >
                          Yes
                        </Button>
                      </Flex>
                    </div>
                  </div>
                )}
              </>
            )}
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default Leavehistoryfunction
Leavehistoryfunction.propTypes = {
  leave: PropTypes.object,
  updateUserStatus: PropTypes.func,
}
