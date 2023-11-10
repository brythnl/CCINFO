import type { financeMathInput } from "~/types/index.d.ts"

export const useFinanceMathFetch = async <DataT>(endpoint: string, paramInput: financeMathInput, API_TOKEN: string) => {
  let url = `https://demo.portal.aixigo.cloud:443/finance-math/${endpoint}?`

  const keys = Object.keys(paramInput) as Array<keyof typeof paramInput>
  for (const [i, key] of keys.entries()) {
    if (paramInput[key] !== undefined) {
      url += `${String(key)}=${paramInput[key]}`
      if (i <= keys.length - 1) {
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
