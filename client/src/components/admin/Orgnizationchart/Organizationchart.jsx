import React, { useState } from "react"
import {
  Tree,
  TreeNode,
} from "react-organizational-chart"
import { Box, Flex } from "@radix-ui/themes"
import {
  FaCaretSquareDown,
  FaCaretSquareUp,
} from "react-icons/fa"
import { useOrganizationContext } from "../../OrganizationContext"
import { useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import PropTypes from "prop-types"
const OrganizationChart = ({
  data,
  organizationName,
}) => {
  const initialExpandedNodes = [data.role]
  const [expandedNodes, setExpandedNodes] =
    useState(initialExpandedNodes)

  const toggleExpand = (nodeName) => {
    setExpandedNodes((prevExpandedNodes) => {
      if (prevExpandedNodes.includes(nodeName)) {
        return prevExpandedNodes.filter(
          (node) => node !== nodeName
        )
      } else {
        return [...prevExpandedNodes, nodeName]
      }
    })
  }

  const renderTreeNode = (node) => (
    <TreeNode
      label={<NodeLabel node={node} />}
      key={node.name}
    >
      {node.children &&
        expandedNodes.includes(node.name) &&
        node.children.map((child) =>
          renderTreeNode(child)
        )}
    </TreeNode>
  )

  const NodeLabel = ({ node }) => {
    const isExpanded = expandedNodes.includes(
      node.name
    )
    return (
      <Box className=" flex m-auto justify-center">
        <Box
          onClick={() => toggleExpand(node.name)}
          className="cursor-pointer m-1 flex inline-flex items-center border border-gray-300 justify-center p-2 rounded-3xl relative card mb-1.5 bg-neutral-50 dark:bg-gray-800 dark:text-white transition-colors duration-200"
        >
          <Flex className="mr-2">
            {node.role && (
              <>
                <img
                  src={node.image}
                  alt="img"
                  className="w-7 h-7 sm:w-5 md:w-7 lg:w-10 sm:h-5 md:h-7 lg:h-10 object-cover rounded-full"
                />
                <Flex
                  direction={"column"}
                  className="w-auto m-auto bg-violet-500 rounded-xl ml-1 px-1 sm:pr-2 md:pr-2 sm:pb-2 md:pb-2 lg:pb-2"
                >
                  <Box className="font-bold text-xs sm:text-xs md:text-xs lg:text-base">
                    {node.name}
                  </Box>
                  <Flex className="w-auto m-auto flex-col sm:flex-row md:flex-row">
                    <Box className="text-xs sm:text-xs md:text-xs lg:text-sm text-gray-800 dark:text-white mr-2">
                      {node.role}
                    </Box>
                    {node.role === "Manager" && (
                      <Box className="text-xs sm:text-xs md:text-xs lg:text-sm font-bold ">
                        <pre>
                          - {node.department}
                        </pre>
                      </Box>
                    )}
                  </Flex>
                </Flex>
              </>
            )}
            {!node.role && node.department && (
              <Box className="font-bold text-sm sm:text-sm md:text-sm lg:text-base text-gray-800 dark:text-white">
                {node.department}
              </Box>
            )}
          </Flex>
          {node.children && (
            <Box className="mt-1 flex items-center justify-center absolute top-3/4 bg-base-100">
              <span>
                {isExpanded ? (
                  <FaCaretSquareUp size={20} />
                ) : (
                  <FaCaretSquareDown size={20} />
                )}
              </span>
            </Box>
          )}
        </Box>
      </Box>
    )
  }
  NodeLabel.propTypes = {
    node: PropTypes.object,
  }

  return (
    <>
      <Box className="font-bold flex text-2xl text-blue justify-center dark:text-white">
        {organizationName}
      </Box>
      <Tree
        lineWidth="2px"
        lineColor="blue"
        lineBorderRadius="10px"
      >
        {renderTreeNode(data)}
      </Tree>
    </>
  )
}
OrganizationChart.propTypes = {
  data: PropTypes.object,
  organizationName: PropTypes.string,
}

const OrganizationChartdata = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const [orgdata, setOrgdata] = useState({})
  const { organizationName, org_slug } =
    useOrganizationContext()
  const getorgdata = () => {
    axios
      .get(`${BASE_URL}/organizationdata`, {
        params: {
          organization_name: organizationName,
          org_slug: org_slug,
        },
      })
      .then((response) => {
        setOrgdata(response.data)
      })
      .catch(() => {
        toast.error(
          "Please fill the organization's CEO details"
        )
      })
  }
  useEffect(() => {
    getorgdata()
  }, [])
  return (
    <Box className="h-[80vh] w-auto ">
      <OrganizationChart
        data={orgdata}
        organizationName={organizationName}
      />
    </Box>
  )
}

export default OrganizationChartdata
