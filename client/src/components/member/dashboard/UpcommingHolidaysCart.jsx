import React, { useState, useEffect } from "react"
import {
  Box,
  Button,
  Dialog,
  Flex,
  Separator,
  Table,
  Text,
  Badge,
} from "@radix-ui/themes"
import { FcLeave } from "react-icons/fc"
import { RxCrossCircled } from "react-icons/rx"
import { DialogClose } from "@radix-ui/react-dialog"
import axios from "axios"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"
import ModernPagination from "../../ModernPagination"
import FadeLoader from "react-spinners/FadeLoader"
import { useOrganizationContext } from "../../OrganizationContext"

function UpcomingHolidaysCart() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [holidays, setHolidays] = useState([])
  const [currentPage, setCurrentPage] =
    useState(0)
  const itemsPerPage = 7
  const [dialogOpen, setDialogOpen] =
    useState(false)
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const { org_slug } = useOrganizationContext()
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
    const fetchHolidays = async () => {
      try {
        const today = new Date()
        const currentYear =
          new Date().getFullYear()
        const endDate = new Date(
          currentYear,
          11,
          31
        )
        const response = await axios.get(
          `${BASE_URL}/holidays`,
          {
            params: {
              org_slug: org_slug,
            },
          }
        )

        const translatedHolidays =
          response.data.data.map((holiday) => {
            return {
              ...holiday,
              summary: t(
                `holidaySummaries.${holiday.summary}`,
                holiday.summary
              ),
            }
          })
        const upcomingHolidays =
          translatedHolidays.filter((holiday) => {
            const holidayDate = new Date(
              holiday.date
            )
            return (
              holidayDate >= today &&
              holidayDate <= endDate
            )
          })
        upcomingHolidays.sort(
          (a, b) =>
            new Date(a.date) - new Date(b.date)
        )
        setHolidays(upcomingHolidays)
        setLoading(false)
      } catch (error) {
        toast.error(
          "Error fetching holidays in holiday section"
        )
        setLoading(false)
      }
    }
    fetchHolidays()
  }, [])

  const getHolidayTypeBadge = (type) => {
    const badgeTranslations = {
      Mandatory: t("Mandatory"),
      Optional: t("Optional"),
      Suggested: t("Suggested"),
    }
    const badgeColors = {
      Mandatory: "green",
      Optional: "blue",
      Suggested: "purple",
    }

    if (type && badgeColors[type]) {
      const color = badgeColors[type]
      return (
        <Badge color={color}>
          {badgeTranslations[type]}
        </Badge>
      )
    } else {
      return null
    }
  }

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected)
  }

  const handleShowAll = () => {
    setDialogOpen(true)
    setCurrentPage(0)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  const offset = currentPage * itemsPerPage
  const paginatedHolidays = holidays.slice(
    offset,
    offset + itemsPerPage
  )

  return (
    <Box className="relative flex flex-col rounded-[0.4rem] w-full p-6 py-3 bg-base-100 shadow-xl mt-3 dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
      <Box className="text-xl font-semibold">
        <Text
          size="5"
          className="dark:text-white"
        >
          {t("upcomingHolidaysTitle")}
        </Text>
      </Box>
      <Box className="divider my-1 dark:border-gray-700"></Box>
      <Box className="h-full w-full bg-base-100 dark:bg-gray-800">
        {holidays.length !== 0 ? (
          holidays
            .slice(0, 3)
            .map((holiday, index) => (
              <>
                <Flex
                  key={index}
                  className="py-1"
                >
                  <Box className="w-2/12 h-2 ml-1 pb-2">
                    <FcLeave size="44" />
                  </Box>

                  <Box className="w-4/5">
                    <Text
                      as="div"
                      className="font-bold text-base dark:text-white"
                    >
                      {t(
                        `holidaySummaries.${holiday.summary}`,
                        holiday.summary
                      )}
                    </Text>
                    <Text
                      as="div"
                      className="text-base dark:text-gray-300"
                    >
                      {t("holidayDate", {
                        date: holiday.date,
                      })}
                    </Text>
                  </Box>

                  <Box className="text-base w-1/4">
                    {getHolidayTypeBadge(
                      holiday.holiday_type
                    )}
                  </Box>
                </Flex>
                {index !==
                  holidays.length - 1 && (
                  <Separator
                    size="4"
                    className="dark:bg-gray-700"
                  />
                )}
              </>
            ))
        ) : loading ? (
          <Box className="flex justify-center py-20">
            <FadeLoader
              color={
                currentTheme === "dark"
                  ? "#ffffff"
                  : "#2563eb"
              }
            />
          </Box>
        ) : (
          <Box>
            <Flex
              gap="0.625rem"
              alignItems="center"
            >
              <Table.Root>
                <Table.Row className="inline-flex">
                  <Box className="w-6 pt-2 h-2 ml-1">
                    <FcLeave size="40" />
                  </Box>
                  <Text className="ml-12 px-16 font-bold text-base dark:text-white">
                    {t("noHolidaysMessage")}
                  </Text>
                </Table.Row>
                <Table.Row>
                  <Text className="ml-12 px-16 font-bold text-base dark:text-white">
                    {t("loadingMessage")}
                  </Text>
                </Table.Row>
              </Table.Root>
            </Flex>
          </Box>
        )}
      </Box>
      <Box></Box>
      <Dialog.Root
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      >
        <Box className="flex justify-center">
          <Dialog.Trigger>
            <Button
              variant="ghost"
              onClick={handleShowAll}
              className="dark:text-blue-400"
            >
              <Text className="text-blue-900 text-lg cursor-pointer dark:text-blue-400">
                {holidays.length !== 0
                  ? t("showAll")
                  : ""}
              </Text>
            </Button>
          </Dialog.Trigger>
        </Box>
        <Dialog.Content className="min-h-[90vh] w-[90vw] max-w-[400px] sm:w-[90vw] sm:max-w-[600px] position: relative h-full dark:bg-gray-800 dark:border-gray-700">
          <Box className="p-5 h-full flex flex-col justify-between overflow-hidden">
            <Box>
              <Flex
                justify="between"
                className="mb-3"
              >
                <Dialog.Title className="font-bold text-2xl dark:text-white">
                  {t("holidays")}
                </Dialog.Title>
                <DialogClose>
                  <RxCrossCircled
                    size="24"
                    className="mt-[-15px] dark:text-white"
                    onClick={handleCloseDialog}
                  />
                </DialogClose>
              </Flex>
              <Flex
                direction="column"
                gap="1.25rem"
              >
                {paginatedHolidays
                  .slice(0, 7)
                  .map((holiday, index) => (
                    <Box key={index}>
                      <Flex
                        gap="2.5rem"
                        alignItems="center"
                      >
                        <Table.Root>
                          <Table.Row className="inline-flex justify-between">
                            <Box className="w-6 pt-2 h-2 ml-1">
                              <FcLeave size="40" />
                            </Box>

                            <Box className="pl-9 w-96 font-bold text-base dark:text-white">
                              {t(
                                `${holiday.summary}`
                              )}
                            </Box>

                            <Box className="flex justify-end text-base">
                              {getHolidayTypeBadge(
                                holiday.holiday_type
                              )}
                            </Box>
                          </Table.Row>
                          <Table.Row>
                            <Text className="ml-12 px-16 text-base dark:text-gray-300">
                              {holiday.date}
                            </Text>
                          </Table.Row>
                        </Table.Root>
                      </Flex>
                      {index !==
                        paginatedHolidays.length -
                          1 && (
                        <Separator
                          size="4"
                          my="2"
                          className="dark:bg-gray-700"
                        />
                      )}
                    </Box>
                  ))}
              </Flex>
            </Box>
            <Flex
              justify="center"
              align="center"
            >
              <ModernPagination
                total={holidays.length}
                pageSize={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                showEdges={true}
              />
            </Flex>
          </Box>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  )
}

export default UpcomingHolidaysCart
