import React, { useState, useEffect } from "react"
import { Table } from "@radix-ui/themes"
import PropTypes from "prop-types"
import toast from "react-hot-toast"

const DateOptions = ({
  date,
  onChange,
  defaultValue,
  change,
  swapCount,
}) => {
  const [fullLeave, setFullLeave] =
    useState(false)
  const [wfh, setWfh] = useState(false)
  const [secondHalf, setSecondHalf] =
    useState(false)
  const [firstHalf, setFirstHalf] =
    useState(false)
  const [useSwap, setUseSwap] = useState(false)

  const handleOptionChange = (
    optionType,
    value
  ) => {
    if (optionType === "fullLeave") {
      if (value) {
        setFullLeave(true)
        setFirstHalf(false)
        setSecondHalf(false)
        setWfh(false)
      }
    } else if (optionType === "firstHalf") {
      if (value) {
        setFirstHalf(true)
        setSecondHalf(false)
        setFullLeave(false)
      }
    } else if (optionType === "secondHalf") {
      if (value) {
        setSecondHalf(true)
        setFirstHalf(false)
        setFullLeave(false)
      }
    } else if (optionType === "wfh") {
      if (value) {
        setWfh(true)
        setFullLeave(false)
        setUseSwap(false)
        onChange(date, "useSwap", false)
      } else {
        setWfh(false)
      }
    } else if (optionType === "useSwap") {
      if (value) {
        if (swapCount <= 0) {
          toast.error("Not sufficient swap count")
          return
        }
        let requiredSwap = 0
        if (fullLeave) {
          requiredSwap = 1
        } else if (firstHalf || secondHalf) {
          requiredSwap = 0.5
        }

        if (requiredSwap > swapCount) {
          toast.error(
            "Not sufficient swap count for this selection"
          )
          return
        }
        setUseSwap(true)
        setWfh(false)
        onChange(date, "wfh", false)
        if (swapCount - requiredSwap <= 0) {
          document
            .querySelectorAll(
              `input[type="checkbox"][value="useSwap"]`
            )
            .forEach((el) => {
              if (
                el.name !== date &&
                el.checked
              ) {
                el.click()
              }
            })
        }
      } else {
        setUseSwap(false)
      }
    }
    onChange(date, optionType, value)
  }

  useEffect(() => {
    setFirstHalf(defaultValue === "firstHalf")
    setSecondHalf(defaultValue === "secondHalf")
    setFullLeave(defaultValue === "fullLeave")
    setWfh(defaultValue === "wfh")
    setUseSwap(defaultValue === "useSwap")
  }, [change])

  return (
    <Table.Row
      key={date}
      className="text-center text-xs dark:text-gray-200"
    >
      <Table.Cell className="dark:text-gray-200">
        {date}
      </Table.Cell>
      <Table.Cell>
        <input
          type="radio"
          value="firstHalf"
          name={date}
          checked={firstHalf}
          onChange={(e) =>
            handleOptionChange(
              "firstHalf",
              e.target.checked
            )
          }
          className="dark:bg-gray-700 dark:border-gray-600"
        />
      </Table.Cell>
      <Table.Cell>
        <input
          type="radio"
          value="secondHalf"
          name={date}
          checked={secondHalf}
          onChange={(e) =>
            handleOptionChange(
              "secondHalf",
              e.target.checked
            )
          }
          className="dark:bg-gray-700 dark:border-gray-600"
        />
      </Table.Cell>
      <Table.Cell>
        <input
          type="radio"
          value="fullLeave"
          name={date}
          checked={fullLeave}
          onChange={(e) =>
            handleOptionChange(
              "fullLeave",
              e.target.checked
            )
          }
          className="dark:bg-gray-700 dark:border-gray-600"
        />
      </Table.Cell>
      <Table.Cell>
        <input
          type="checkbox"
          value="wfh"
          name={date}
          checked={wfh}
          onChange={(e) =>
            handleOptionChange(
              "wfh",
              e.target.checked
            )
          }
          className="dark:bg-gray-700 dark:border-gray-600"
        />
      </Table.Cell>
      <Table.Cell>
        <input
          type="checkbox"
          value="useSwap"
          name={date}
          checked={useSwap}
          onChange={(e) =>
            handleOptionChange(
              "useSwap",
              e.target.checked
            )
          }
          className="dark:bg-gray-700 dark:border-gray-600"
        />
      </Table.Cell>
    </Table.Row>
  )
}
DateOptions.propTypes = {
  date: PropTypes.string,
  onChange: PropTypes.func,
  defaultValue: PropTypes.string,
  change: PropTypes.bool,
  swapCount: PropTypes.number,
}

export default DateOptions
