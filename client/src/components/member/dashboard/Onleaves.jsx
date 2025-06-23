import React, { useState, useEffect } from "react"
import {
  Flex,
  Text,
  Box,
  HoverCard,
  Inset,
  Grid,
  Portal,
  Card,
  Button,
} from "@radix-ui/themes"
import axios from "axios"
import { useTranslation } from "react-i18next"
import { FadeLoader } from "react-spinners"
import toast from "react-hot-toast"
import { useOrganizationContext } from "../../OrganizationContext"

const Onleaves = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    data: [],
  })
  const [displayedInPopup, setDisplayedInPopup] =
    useState([])
  const [flag, setflag] = useState(false)
  const [peopleOnLeave, setPeopleOnLeave] =
    useState([])
  const { organizationName, org_slug, socket } =
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

    const handleMessage = () => {
      fetchData()
    }
    socket.addEventListener(
      "message",
      handleMessage
    )
    return () =>
      socket.removeEventListener(
        "message",
        handleMessage
      )
  }, [])

  const fetchData = () => {
    setLoading(true)
    axios
      .get(
        `${BASE_URL}/get_all_accepted_leave_requests`,
        {
          params: {
            organization_name: organizationName,
            org_slug: org_slug,
          },
        }
      )
      .then((response) => {
        setFormData(response.data.leave_requests)
        if (
          response.data.leave_requests.length > 0
        ) {
          setPeopleOnLeave(
            response.data.leave_requests.slice(
              0,
              5
            )
          )
        } else {
          setPeopleOnLeave([])
        }
        setLoading(false)
      })
      .catch(() => {
        toast.error(
          "Error fetching leave requests"
        )
        setLoading(false)
      })
  }

  const handleShowAll = () => {
    setDisplayedInPopup(formData.slice(5))
    setflag(true)
  }

  const handleClose = () => {
    setDisplayedInPopup([])
    setflag(false)
  }

  const handlePopupClick = (e) => {
    e.stopPropagation()
  }

  const isShowAllDisabled =
    peopleOnLeave.length < 5

  return (
    <Box className="relative flex flex-col rounded-[0.4rem] w-full p-6 py-3 bg-base-100 shadow-xl mt-3 dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
      <Grid columns="0.5fr 0.5fr">
        <Text
          as="div"
          size="5"
          weight="bold"
          className="text-xl font-semibold dark:text-white"
        >
          {t("onLeave")}
        </Text>
        <Box
          align="right"
          size="5"
        >
          {!isShowAllDisabled && (
            <Button
              variant="ghost"
              onClick={handleShowAll}
              className="dark:text-blue-400"
            >
              <Text className="text-blue-900 text-lg cursor-pointer dark:text-blue-400">
                {t("showMore")}
              </Text>
            </Button>
          )}
        </Box>
      </Grid>
      <Box className="divider my-1 dark:border-gray-700"></Box>
      <Box className="h-full w-full bg-base-100 dark:bg-gray-800">
        {loading ? (
          <Flex
            justify="center"
            className="w-full h-full items-center"
          >
            <FadeLoader
              color={
                currentTheme === "dark"
                  ? "#ffffff"
                  : "#2563eb"
              }
            />
          </Flex>
        ) : peopleOnLeave.length === 0 ? (
          <Flex
            justify="center"
            mt="9"
          >
            <Text
              size="5"
              className="text-gray-600 dark:text-gray-300"
            >
              {t("noOneIsOnLeave")}
            </Text>
          </Flex>
        ) : (
          <Flex
            direction="row"
            gap="5"
          >
            {peopleOnLeave.map((person) => (
              <Inset
                clip="padding-box"
                side="top"
                pb="current"
                key={person.id}
              >
                <HoverCard.Root>
                  <HoverCard.Trigger>
                    <Flex
                      direction="column"
                      borderColor="white"
                      align="center"
                      gap="3"
                    >
                      <Box className="py-4">
                        {person.imageurl ? (
                          <img
                            src={person.imageurl}
                            alt={person.name}
                            className="rounded-2xl images"
                          />
                        ) : (
                          <div className="unavailable dark:bg-gray-700 dark:text-white">
                            <Text size="3">
                              Image
                              <br />
                              Unavailable
                            </Text>
                          </div>
                        )}
                      </Box>
                      <Text
                        weight="bold"
                        size="3"
                        className="dark:text-white"
                      >
                        {person.username}
                      </Text>
                    </Flex>
                  </HoverCard.Trigger>
                  <HoverCard.Content
                    sideOffset={10}
                    alignOffset={10}
                    className="dark:bg-gray-700 dark:border-gray-600"
                  >
                    <Flex
                      direction="column"
                      gap="1"
                    >
                      <Flex>
                        <Text
                          weight="bold"
                          size="2"
                          mr="1"
                          className="dark:text-white"
                        >
                          {t("NameLabel")}&thinsp;
                        </Text>
                        <Text
                          mt="1"
                          size="1"
                          className="dark:text-gray-300"
                        >
                          {person.username}
                        </Text>
                      </Flex>
                      <Box>
                        <Text
                          weight="bold"
                          size="2"
                          mr="1"
                          className="dark:text-white"
                        >
                          {t("EmailLabel")}
                          &thinsp;
                        </Text>
                        <Text
                          size="1"
                          className="dark:text-gray-300"
                        >
                          {person.email}
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          weight="bold"
                          size="2"
                          mr="1"
                          className="dark:text-white"
                        >
                          {t("ReasonLabel")}
                          &thinsp;
                        </Text>
                        <Text
                          mt="1"
                          size="1"
                          className="dark:text-gray-300"
                        >
                          {person.leave_type}
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          weight="bold"
                          size="2"
                          mr="1"
                          className="dark:text-white"
                        >
                          {t("Startdate")}&thinsp;
                        </Text>
                        <Text
                          size="1"
                          className="dark:text-gray-300"
                        >
                          {person.start_date}
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          weight="bold"
                          size="2"
                          mr="1"
                          className="dark:text-white"
                        >
                          {t("Enddate")}&thinsp;
                        </Text>
                        <Text
                          size="1"
                          className="dark:text-gray-300"
                        >
                          {person.end_date}
                        </Text>
                      </Box>
                    </Flex>
                  </HoverCard.Content>
                </HoverCard.Root>
              </Inset>
            ))}
          </Flex>
        )}
        {flag && (
          <Portal>
            <Box
              className="popup"
              onClick={handleClose}
            >
              <Card
                className="popupcard"
                style={{
                  backgroundColor:
                    currentTheme === "dark"
                      ? "#374151"
                      : "white",
                  borderRadius: "10px",
                  borderColor:
                    currentTheme === "dark"
                      ? "#4B5563"
                      : undefined,
                }}
                onClick={handlePopupClick}
              >
                <Box className="mb-3 text-lg">
                  <Text className="dark:text-white">
                    {t("RemainingOnLeave")}
                  </Text>
                </Box>
                <Flex
                  direction="column"
                  gap="5"
                  padding="20px"
                  className="onleave"
                >
                  {displayedInPopup.map(
                    (person) => (
                      <Flex
                        key={person.id}
                        align="center"
                        gap="3"
                        className="onleavepopup"
                      >
                        <Box>
                          <img
                            src={person.imageurl}
                            alt={person.username}
                            className="rounded-2xl popupscroll"
                          />
                        </Box>
                        <Flex direction="column">
                          <Box>
                            <b
                              size="2"
                              className="dark:text-white"
                            >
                              {t("NameLabel")}
                              &thinsp;
                            </b>
                            <Text
                              mt="1"
                              size="1"
                              className="dark:text-gray-300"
                            >
                              {person.username}
                            </Text>
                          </Box>
                          <Box>
                            <b
                              size="2"
                              className="dark:text-white"
                            >
                              {t("EmailLabel")}
                              &thinsp;
                            </b>
                            <Text
                              size="1"
                              className="dark:text-gray-300"
                            >
                              {person.email}
                            </Text>
                          </Box>
                          <Box>
                            <b
                              size="2"
                              className="dark:text-white"
                            >
                              {t("ReasonLabel")}
                              &thinsp;
                            </b>
                            <Text
                              size="1"
                              className="dark:text-gray-300"
                            >
                              {person.leave_type}
                            </Text>
                          </Box>
                        </Flex>
                      </Flex>
                    )
                  )}
                </Flex>
              </Card>
            </Box>
          </Portal>
        )}
      </Box>
    </Box>
  )
}

export default Onleaves
