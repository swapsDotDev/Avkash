import React from "react"
import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon"
import { Box } from "@radix-ui/themes"
import PropTypes from "prop-types"
function RightSidebar({
  open,
  setOpen,
  List,
  removeNotification,
}) {
  const close = () => {
    setOpen(false)
  }
  RightSidebar.propTypes = {
    open,
    setOpen,
    List,
    removeNotification:
      PropTypes.string.isRequired,
  }
  return (
    <Box
      className={
        "fixed overflow-hidden z-20 bg-gray-900 bg-opacity-25 dark:bg-opacity-50 inset-0 transform ease-in-out " +
        (open
          ? "transition-opacity opacity-100 duration-500 translate-x-0"
          : "transition-all delay-500 opacity-0 translate-x-full")
      }
    >
      <section
        className={
          "w-80 md:w-96 right-0 absolute bg-white dark:bg-gray-800 h-full shadow-xl delay-400 duration-500 ease-in-out transition-all transform " +
          (open
            ? "translate-x-0"
            : "translate-x-full")
        }
      >
        <Box className="relative pb-5 flex flex-col h-full">
          <Box className="navbar flex pl-4 pr-4 shadow-md bg-gray-100 dark:bg-gray-700">
            <button
              className="float-left btn btn-circle btn-outline btn-sm dark:text-white"
              onClick={() => close()}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <span className="ml-2 font-bold text-xl text-black dark:text-white">
              Notifications
            </span>
          </Box>
          <Box className="overflow-y-scroll pl-4 pr-4">
            <Box className="flex flex-col w-full">
              {List.map((_, i) => {
                return (
                  <Box
                    key={i}
                    className={
                      "grid mt-3 relative flex flex-col rounded-[0.4rem] bg-gray-100 dark:bg-gray-700 p-3 " +
                      (i < 5
                        ? "bg-blue-100 dark:bg-blue-900"
                        : "")
                    }
                  >
                    <span className="text-black dark:text-white">
                      {_.message}
                    </span>
                    <button
                      className="absolute top-0 bottom-0 right-[4px] dark:text-white"
                      onClick={() =>
                        removeNotification(i)
                      }
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </Box>
                )
              })}
            </Box>
          </Box>
        </Box>
      </section>

      <section
        className="w-screen h-full cursor-pointer"
        onClick={() => close()}
      ></section>
    </Box>
  )
}

export default RightSidebar
