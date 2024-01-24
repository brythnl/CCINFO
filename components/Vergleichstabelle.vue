<script lang="ts" setup>
import type { financeMathInput, financeMathResult } from "~/types/index.d.ts";
import { useDayjs } from "#dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

interface difference {
  sign: string;
  value: string | number;
  unit: string;
}

interface combinedData {
  name: string;
  previousValue: string | string[];
  currentValue: string | string[];
  valueDifference: difference;
}

type financeMathTypes = string | string[] | number | number[];

const { t, n } = useI18n();
const dayjs = useDayjs();
dayjs.extend(customParseFormat);

const props = defineProps<{
  oldRequest?: financeMathInput;
  newRequest?: financeMathInput;
  oldRequestEntnahme?: financeMathInput;
  newRequestEntnahme?: financeMathInput;
  oldResponse?: financeMathResult;
  newResponse?: financeMathResult;
  endpoint?: string;
  isKombiplan?: boolean;
}>();

const requestComparisonArray: combinedData[] = computed(() => {
  if (props.oldRequest && props.newRequest) {
    return createCombinedArray(
      JSON.parse(JSON.stringify(props.oldRequest)),
      JSON.parse(JSON.stringify(props.newRequest)),
    );
  } else return [];
});

const requestComparisonArrayEntnahme: combinedData[] = computed(() => {
  if (props.oldRequestEntnahme && props.newRequestEntnahme) {
    return createCombinedArray(
      JSON.parse(JSON.stringify(props.oldRequestEntnahme)),
      JSON.parse(JSON.stringify(props.newRequestEntnahme)),
    );
  } else return [];
});

const responseFilteredComparisonArray: combinedData[] = computed(() => {
  if (props.oldResponse && props.newResponse) {
    return filterCombinedArrayResp(
      createCombinedArray(
        JSON.parse(JSON.stringify(props.oldResponse)),
        JSON.parse(JSON.stringify(props.newResponse)),
      ),
      props.endpoint,
    );
  } else return [];
});

const fieldNames = {
  begin: t("fieldNames.begin"),
  end: t("fieldNames.end"),
  interestRate: t("fieldNames.interestRate"),
  oneTimeInvestment: t("fieldNames.oneTimeInvestment"),
  oneTimeInvestmentDate: t("fieldNames.oneTimeInvestmentDate"),
  savingRate: t("fieldNames.savingRate"),
  endValue: t("fieldNames.endValue"),
  interestCalculation: "",
  dynamicSavingRateFactor: "",
  reductionFactor: "",
  savingPlanBegin: "",
  savingPlanEnd: "",
  capitalAmount: t("fieldNames.capitalAmount"),
  startInvestment: t("fieldNames.startInvestment"),
};

const createCombinedArray = (
  previousData: financeMathInput | financeMathResult,
  currentData: financeMathInput | financeMathResult,
): combinedData[] => {
  const combinedArray = [];
  let previousValue: financeMathTypes, currentValue: financeMathTypes;

  for (const key in previousData) {
    if (key === "capitalResult") {
      for (const capitalResultKey in previousData[key]) {
        previousValue = previousData[key][capitalResultKey];
        currentValue = currentData[key][capitalResultKey];
        const valueDifference = calculateDifference(
          previousValue,
          currentValue,
        );

        if (valueDifference !== 0 && valueDifference !== "") {
          combinedArray.push({
            name: fieldNames[capitalResultKey],
            previousValue: formatValue(previousValue, capitalResultKey),
            currentValue: formatValue(currentValue, capitalResultKey),
            valueDifference: formatDifference(
              valueDifference,
              capitalResultKey,
            ),
          });
        }
      }
    } else if (key === "capitalSeries") {
      break;
    } else {
      previousValue = previousData[key];
      currentValue = currentData[key];
      const valueDifference = calculateDifference(previousValue, currentValue);

      if (valueDifference !== 0 && valueDifference !== "") {
        combinedArray.push({
          name: fieldNames[key],
          previousValue: formatValue(previousValue, key),
          currentValue: formatValue(currentValue, key),
          valueDifference: formatDifference(valueDifference, key),
        });
      }
    }
  }

  return combinedArray;
};

const filterCombinedArrayResp = (
  comparisonArray: combinedData[],
  requestEndpoint: string,
): combinedData[] => {
  let selectedEndpoint: string;

  switch (requestEndpoint) {
    case "capital":
      selectedEndpoint = fieldNames["capitalAmount"];
      break;
    case "end-date":
      selectedEndpoint = fieldNames["end"];
      break;
    case "interest-rate":
      selectedEndpoint = fieldNames["interestRate"];
      break;
    case "saving-rate":
      selectedEndpoint = fieldNames["savingRate"];
      break;
    case "saving-start-value":
      selectedEndpoint = fieldNames["startInvestment"];
      break;
  }

  return comparisonArray.filter(
    (item) => item && item.name === selectedEndpoint,
  );
};

const formatValue = (
  value: string | number | Array<string | number>,
  key: string,
): string | string[] => {
  const formatSingleValue = (value: string | number): string => {
    if (typeof value === "string" && dayjs(value).isValid()) {
      return dayjs(value).format("DD.MM.YYYY");
    }

    if (typeof value === "number") {
      return key === "interestRate"
        ? `${(value * 100).toFixed(2)} %`
        : `${n(value / 100, "currency")}`;
    }

    return value;
  };

  if (Array.isArray(value)) {
    if (value.length === 1) {
      return formatSingleValue(value[0] as string | number);
    }

    return value.map(formatSingleValue);
  }

  return formatSingleValue(value as string | number);
};

const calculateDifference = (
  previousValue: string | number | Array<string | number>,
  currentValue: string | number | Array<string | number>,
): string | number => {
  const calculateSingleDifference = (
    previousValue: string | number,
    currentValue: string | number,
  ): string | number => {
    if (typeof previousValue === "number" && typeof currentValue === "number") {
      return currentValue - previousValue;
    }

    if (typeof previousValue === "string" && dayjs(previousValue).isValid()) {
      const previousDate = dayjs(previousValue);
      const currentDate = dayjs(currentValue);

      return currentDate.diff(previousDate, "month");
    }

    return "";
  };

  if (Array.isArray(previousValue) && Array.isArray(currentValue)) {
    if (previousValue.length === 1 && currentValue.length === 1) {
      return calculateSingleDifference(
        previousValue[0] as string | number,
        currentValue[0] as string | number,
      );
    }

    // This is a placeholder. Real solution for finding the difference for Startkapital (Array) not yet found.
    return "array";
  }

  return calculateSingleDifference(
    previousValue as string | number,
    currentValue as string | number,
  );
};

const formatDifference = (
  difference: string | number,
  key: string,
): difference => {
  if (typeof difference === "string") {
    return {
      sign: "",
      value: difference,
      unit: "",
    };
  }

  const sign = difference > 0 ? "+" : "";
  let unit: string;

  if (key === "begin" || key === "end" || key === "oneTimeInvestmentDate") {
    if (difference >= 12 || difference <= -12) {
      difference = Math.round(difference / 12);
      unit = t("vergleichstabelle.jahre");
    } else {
      unit = t("vergleichstabelle.monate");
    }

    return {
      sign,
      value: difference,
      unit,
    };
  } else {
    if (key === "interestRate") {
      difference = (difference * 100).toFixed(2);
      unit = "%";
    } else {
      difference /= 100;
      unit = "";
    }

    return {
      sign,
      value: difference,
      unit,
    };
  }
};
</script>

<template>
  <div>
    <h4 class="flex justify-center pt-5 pb-3 font-bold text-lg">
      <v-icon class="pe-2">mdi-swap-horizontal</v-icon>
      {{ $t("vergleichstabelle.anderungen") }}
    </h4>
    <div>
      <v-sheet
        class="rounded-lg elevation-0 bg-primary py-2 mb-3"
        v-if="isKombiplan"
      >
        <h1 class="text-white ps-5 font-bold">
          {{ $t("vergleichstabelle.sparphase") }}
        </h1>
      </v-sheet>
      <VergleichsSubtabelle :combinedArray="requestComparisonArray" />
    </div>
    <div v-if="isKombiplan">
      <v-sheet class="rounded-lg elevation-0 bg-primary py-2 mt-5 mb-3">
        <h1 class="text-white ps-5 font-bold">
          {{ $t("vergleichstabelle.entnahmephase") }}
        </h1>
      </v-sheet>
      <VergleichsSubtabelle :combinedArray="requestComparisonArrayEntnahme" />
    </div>
  </div>
  <div>
    <h4
      v-if="!isKombiplan"
      class="flex justify-center pt-10 pb-3 font-bold text-lg"
    >
      <v-icon class="pe-2">mdi-equal-box</v-icon>
      {{ $t("vergleichstabelle.ergebnis") }}
    </h4>
    <h4 v-else class="flex justify-center pt-5 pb-3 font-bold text-lg">
      <v-icon class="pe-2">mdi-equal-box</v-icon>
      {{ $t("vergleichstabelle.ergebnis") }}
    </h4>
    <VergleichsSubtabelle :combinedArray="responseFilteredComparisonArray" />
  </div>
</template>
