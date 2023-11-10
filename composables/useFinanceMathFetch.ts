import type { financeMathInput } from "~/types/index.d.ts"

export const useFinanceMathFetch = async <DataT>(endpoint: string, paramInput: financeMathInput, API_TOKEN: string) => {
  let url = `https://demo.portal.aixigo.cloud:443/finance-math/${endpoint}?`

  // append input from form as query parameters for the API call
  const keys = Object.keys(paramInput) as Array<keyof typeof paramInput>
  for (const [i, key] of keys.entries()) {
    if (paramInput[key] !== undefined || paramInput[key] !== 'endpoint') {
      url += `${String(key)}=${paramInput[key]}`
      if (i <= keys.length - 2) {
        url += "&"
      }
    }
  }

  return useFetch<DataT>(url,
    {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
    }
  )
}
