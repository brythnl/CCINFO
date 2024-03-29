<script setup lang="ts">
import { Chart as highcharts } from "highcharts-vue";

const props = defineProps(["series", "result", "prevSeries", "prevResult"]);
const yearsToSeries = ref([]);
const yearsToSeriesPrev = ref([]);

import { computed } from "vue";
const { t } = useI18n();
const { n } = useI18n();

let name = t("graph.title");

function translate_tooltip(p_year, p_capital) {
  let year = new Date(p_year).getFullYear();
  let capital = n(p_capital, "currencyNoCents");

  return t("graph.tooltip", { year: year, capital: capital });
}

const assignYearsToSeries = (series: [], result: {}) => {
  const seriesCount = series.length; // Length of the series
  const endYear = new Date(result.end).getFullYear();

  // Calculate the appropriate year 0f the series entry
  let appropriateYear = endYear - seriesCount;

  //Save the Start investment
  const startInvestment = [Date.UTC(appropriateYear++), result.startInvestment];

  const preparedSeries = series.map((element: number) => {
    // Push the series entries to an individual array
    const arr = new Array();
    arr.push(element);

    // Push the appropriate date before the previous entry
    arr.unshift(Date.UTC(appropriateYear++));

    return arr;
  });

  // Put the start investemnt at the beginning of the preparedSeries arrays
  preparedSeries.unshift(startInvestment);

  return preparedSeries;
};

onMounted(() => {
  yearsToSeries.value = assignYearsToSeries(props.series, props.result);
});

watch(
  () => props,
  (newValue, oldValue) => {
    // Control the range of the y axis
    yearsToSeriesPrev.value = assignYearsToSeries(
      newValue.prevSeries,
      newValue.prevResult,
    );
    yearsToSeries.value = assignYearsToSeries(newValue.series, newValue.result);
  },
  { deep: true },
);
</script>

<template>
  <highcharts
    class="mt-5 text-sm"
    :options="{
      chart: {
        type: 'area', // Basic area chart
        lang: {
          numericSymbols: null, //otherwise by default ['k', 'M', 'G', 'T', 'P', 'E']
        },
      },
      title: {
        text: $t('graph.title'),
        style: {
          fontSize: '18px',
          fontFamily: 'Poppins',
        },
      },

      xAxis: {
        type: 'datetime',
        labels: {
          format: '{value:%Y}', // Fromat the year display
        },
        // To spend the first and last year in any case
        tickPositioner: function () {
          var positions = [],
            dataMin = yearsToSeries[0][0],
            dataMax = yearsToSeries[yearsToSeries.length - 1][0];

          //Add the first and last year to the list of positions
          positions.push(dataMin);
          positions.push(dataMax);

          return positions;
        },
        tickInterval: 1,
        title: {
          text: $t('graph.years'),
        },
      },
      yAxis: {
        //visible: false, // Don't show the Y Axis
        title: {
          text: null,
        },
        labels: {
          formatter: function () {
            return n(this.value, 'currencyNoCents');
          },
        },
      },
      series: [
        {
          name: $t('graph.prev_graph'),
          showInLegend: prevSeries.length,
          data: yearsToSeriesPrev,
          color: '#00476B',
        },
        {
          name: $t('graph.curr_graph'),
          showInLegend: series.length,
          data: yearsToSeries,
          color: '#4195ac',
        },
      ],
      tooltip: {
        formatter: function () {
          return translate_tooltip(this.x, this.y);
        },
      },
    }"
  ></highcharts>
</template>

<style scoped></style>
