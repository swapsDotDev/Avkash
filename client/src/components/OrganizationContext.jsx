import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react"
import { useOrganization } from "@clerk/clerk-react"
import axios from "axios"
import PropTypes from "prop-types"

const OrganizationContext = createContext()

const useOrganizationContext = () =>
  useContext(OrganizationContext)

const OrganizationProvider = ({ children }) => {
  const { organization } = useOrganization()
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const [organizationName, setOrganizationName] =
    useState("")
  const [
    organizationImage,
    setOrganizationImage,
  ] = useState("")
  const [socket, setSocket] = useState(null)
  const org_slug = organization?.slug
  useEffect(() => {
    const webSocketApi = async () => {
      const ws = await new WebSocket(
        "ws://localhost:8000/ws"
      )
      setSocket(ws)
      return () => ws.close()
    }
    webSocketApi()
  }, [])

  useEffect(() => {
    if (organization) {
      const orgName =
        organization.name ||
        "Your Default Organization Name"
      const orgImage =
        organization.imageUrl || "No Image"
      setOrganizationImage(orgImage)
      setOrganizationName(orgName)

      axios.post(`${BASE_URL}/orgname`, {
        organization: orgName,
        org_slug: org_slug,
      })
    }
  }, [organization])

  return (
    <OrganizationContext.Provider
      value={{
        organizationName,
        organizationImage,
        socket,
        org_slug,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}
OrganizationProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export {
  OrganizationProvider,
  useOrganizationContext,
}
