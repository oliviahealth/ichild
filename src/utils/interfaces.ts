export interface ILocation {
    address: string
    addressLink: string
    confidence: number
    description: string
    name: string
    phone: string
    latitude: number
    longitude: number
    photos: { height: number, html_attributions: string[], photo_reference: string, width: number }[]
}

export interface IAPIResponse {
    locations: ILocation[]
    userQuery: string
}

// A conversation object represents the entire back and forth communication between the user and the chatbot (questions the user asks and the corresponding response)
export interface IConversation {
    title: string
    id: string
    created: Date
    lastAccessed: Date
    responses: IAPIResponse[]
}