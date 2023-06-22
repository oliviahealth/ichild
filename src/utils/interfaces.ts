export interface IOllieResponse {
    question: string
    answer: {
        address: string[]
        unencodedAddress: string[]
        confidences: number[]
        descriptions: string[]
        names: string[]
        notFoundMessage: string
        phone: string[]
        userQuery: string
    }
}