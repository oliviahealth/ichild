import { ZodSchema } from "zod";
import useAppStore from "../stores/useAppStore";

/*
    Parse with zod acts as a wrapper around zod parse
    Takes in the data to parse and the schema to validate against
    If there is an error, set the error state in zustand
*/
const parseWithZod = async (dataToParse: any, zodSchema: ZodSchema) => {
    try {
        const parseResult = await zodSchema.safeParseAsync(dataToParse)

        if(!parseResult.success) {
            throw new Error(parseResult.error.toString())
        }
    } catch (error: any) {
        console.log(error);
        console.log(dataToParse);
        console.log(zodSchema)
        
        useAppStore.setState({ error: 'Something went wrong!' });
        throw error
    }
}

export default parseWithZod;