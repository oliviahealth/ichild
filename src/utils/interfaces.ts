// An OllieResponse object represents the response from the api
export interface IOllieResponse {
    address: string[]
    unencodedAddress: string[]
    addressLinks: string[]
    confidences: number[]
    descriptions: string[]
    names: string[]
    notFoundMessage: string
    phone: string[]
    userQuery: string
}

// A conversation object represents the entire back and forth communication between the user and the chatbot (questions the user asks and the corresponding response)
export interface IConversation {
    title: string
    id: string
    created: Date
    lastAccessed: Date
    responses: IOllieResponse[]
}