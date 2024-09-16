import { generateSolidHelpers } from '@uploadthing/solid';

 import type { OurFileRouter } from "../api/uploadthing/core";
 

 
const useUploadThing = generateSolidHelpers<OurFileRouter>();
export default useUploadThing;