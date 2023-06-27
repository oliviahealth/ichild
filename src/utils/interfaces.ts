export interface IOllieResponse {
    address: string[]
    unencodedAddress: string[]
    confidences: number[]
    descriptions: string[]
    names: string[]
    notFoundMessage: string
    phone: string[]
    userQuery: string
}