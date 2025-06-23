import React from "react"
import Subtitle from "./Subtitle"
import PropTypes from "prop-types"

function TitleCard({
  title,
  children,
  topMargin,
  TopSideButtons,
}) {
  return (
    <div
      className={
        "relative flex flex-col rounded-[0.4rem] w-full p-4 bg-base-100 border border-gray-300 dark:border-gray-600 shadow-sm dark:bg-gray-800 dark:bg-gray-800 " +
        (topMargin || "mt-6")
      }
    >
      <Subtitle
        styleClass={
          TopSideButtons ? "inline-block" : ""
        }
      >
        <span className="text-black dark:text-white">
          {title}
        </span>
        {TopSideButtons && (
          <div className="inline-block float-right">
            {TopSideButtons}
          </div>
        )}
      </Subtitle>
      <div className="divider mt-2 dark:text-white"></div>
      <div className="h-full w-full bg-base-100 dark:bg-gray-800 dark:bg-gray-800 pl-5 pr-3">
        {children}
      </div>
    </div>
  )
}
TitleCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  topMargin: PropTypes.string,
  TopSideButtons: PropTypes.node,
}

export default TitleCard
