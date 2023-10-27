<script lang="ts" setup>

const API_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI4ZksxTW95NkVidjktcjNEQ3IwMXJtemVsY3FkMUpUbVJDaGh6YkxRblpnIn0.eyJleHAiOjE2OTgzNjgxMDEsImlhdCI6MTY5ODM2NDUwMSwiYXV0aF90aW1lIjoxNjk4MzM3MDA4LCJqdGkiOiIwYmEzOWY3Mi1lNGZiLTQ0Y2UtYTMxMi0wN2E1YTExZGRhY2UiLCJpc3MiOiJodHRwczovL2xvZ2luLnBvcnRhbC5haXhpZ28uY2xvdWQvcmVhbG1zL2FwcHMiLCJhdWQiOlsid2Vic2l0ZSIsImRlbW8iXSwic3ViIjoiZmFjaHJpYWwucGVyZGFuYUBhbHVtbmkuZmgtYWFjaGVuLmRlIiwidHlwIjoiSUQiLCJhenAiOiJ3ZWJzaXRlIiwic2Vzc2lvbl9zdGF0ZSI6IjM0YmUyODk4LTljY2EtNDczNy04YWY3LWMwZTQ4NDYzNjAzNCIsImF0X2hhc2giOiJFZHY3ckZRejRrWEZRTTZsY3RKY1JBIiwiYWNyIjoiMCIsInNpZCI6IjM0YmUyODk4LTljY2EtNDczNy04YWY3LWMwZTQ4NDYzNjAzNCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJyb2xlcyI6WyJHVUVTVCJdLCJuYW1lIjoiRmFjaHJpYWwgRGltYXMgUHV0cmEgUGVyZGFuYSIsInByZWZlcnJlZF91c2VybmFtZSI6ImZhY2hyaWFsLnBlcmRhbmFAYWx1bW5pLmZoLWFhY2hlbi5kZSIsImdpdmVuX25hbWUiOiJGYWNocmlhbCBEaW1hcyBQdXRyYSIsImZhbWlseV9uYW1lIjoiUGVyZGFuYSIsInRlbmFudCI6Imd1ZXN0IiwiZW1haWwiOiJmYWNocmlhbC5wZXJkYW5hQGFsdW1uaS5maC1hYWNoZW4uZGUifQ.ZlG58aQdiNfSneBTHOvIzrwKzlgT4O0_M33nxhJb3qa1ITbXctI65A-32rXVVzqaMHYBbMOY4z0duSBnqfXyhrttZ8vENiX8Z6w7oWVo9VfFe_R7qkNIqznOSm9ZTl5fPbMGd1PS87r2XXkrggtfk9D4006JRil94H7pCeaF7xT3wcu_j4GdnOB7cDKZjpgBUZRIf2LCYuMv3SXzuZa3ipOE9hr01Sh6IItl3bGjzPqR1L9SKpX92DylmOjxRyGQqrXd6WBH2y5i991cmrjIodyFbTNpPYNqLypfkyIXgbfYIOj-Xt-zEtYQkTtAGT1jH94TboY7gCkZwxdsi1fn_w"

const capitalInput = reactive({
  beginDate: "",
  endDate: "",
  interestRate: 0,
  interestCalculation: "",
  savingRate: 0
})

const emit= defineEmits(['calculated'])
async function getEndCapital() {
  const { data } = await useFetch('https://demo.portal.aixigo.cloud:443/finance-math/capital', {
    query: { begin: capitalInput.beginDate, end: capitalInput.endDate, interestRate: capitalInput.interestRate, interestCalculation: capitalInput.interestCalculation, savingRate: capitalInput.savingRate },
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${API_TOKEN}`
    }
  })
  
  console.log(toRaw(data.value))
  emit('calculated',toRaw(data.value))
}

</script>

<template>
  <h1>Capital Calculation</h1>
  <v-form>
    <v-container>
      <v-row>
        <v-col>
          <input
            type="date"
            v-model="capitalInput.beginDate"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <input
            type="date"
            v-model="capitalInput.endDate"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field
            v-model="capitalInput.interestRate"
            label="Interest rate"
            required
            hide-details
            type="number"
            step="0.01"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col >
          <v-select
            v-model="capitalInput.interestCalculation"
            clearable
            label="Interest calculation"
            :items="['YEARLY', 'MONTHLY', 'DAILY']"
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col >
          <v-text-field
            v-model="capitalInput.savingRate"
            label="Saving rate"
            required
            hide-details
            type="number"
            step="0.01"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col >
          <v-btn
            :disabled="loading"
            :loading="loading"
            block
            class="text-none mb-4"
            color="indigo-darken-3"
            size="x-large"
            variant="flat"
            @click="getEndCapital"
          >
            Get end capital
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<style scoped></style>
