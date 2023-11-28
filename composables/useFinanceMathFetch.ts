import type { financeMathInput } from "~/types/index.d.ts";

// fetch data from a selected endpoint of the AIXIGO Finance Math API based on the passed input
export const useFinanceMathFetch = <DataT>(
  endpoint: string,
  paramInput: financeMathInput,
  API_TOKEN: string,
) => {
  let url = `https://demo.portal.aixigo.cloud:443/finance-math/${endpoint}?`;

  // append input from form as query parameters for the API call
  const keys = Object.keys(paramInput) as Array<keyof typeof paramInput>;
  for (const [i, key] of keys.entries()) {
    if (paramInput[key] !== (undefined || "") && key !== "endpoint") {
      if (Array.isArray(paramInput[key])) {
        paramInput[key].forEach((item) => {
          url += `${String(key)}=${item}&`;
        });
      } else {
        url += `${String(key)}=${paramInput[key]}&`;
      }
    }
  }
  url = url.slice(0, -1); // Remove trailing '&'
  console.log(url);

  return useFetch<DataT>(url, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
    },
  });
};
