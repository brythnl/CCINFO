<script lang="ts" setup>
import {watch} from "vue";
import {
  nextMonthFirstDay,
  inTenYears,
  validateInput,
  setEndDateToBiggestDate,
} from "~/utils/formUtils";

const emit = defineEmits<{
  (e: "calculateInput", entnahmeplanInput: {}): void;
}>();
//dialog for error inputs
const dialog = ref(false);
const dialogText =ref("");
// Amount of oneTimeInvestment(s)
const einmalZahlung = ref(0);
// Dynamic status
const dynamik = ref(false);
//details status for start capital and withdraw rate
const startkapitalDetails = ref(false);
const sparplanDetails = ref(false);
const iconStartkapital = ref("mdi-chevron-down");
const iconSparplan = ref("mdi-chevron-down");

const props = defineProps<{
  apiResponse: financeMathResult;
}>();

const entnahmeplaninput = reactive({
  begin: nextMonthFirstDay,
  end: inTenYears,
  interestCalculation: "YEARLY",
  interestRate: 0,
  reductionFactor: 0,
  dynamicSavingRateFactor: 0,
  savingPlanBegin: "",
  savingPlanEnd: "",
  oneTimeInvestment: [0],
  oneTimeInvestmentDate: [nextMonthFirstDay],
  savingRate: 0,
  endValue: 0,
  endpoint: "",
});

function toggleStartkapital() {
  if (startkapitalDetails.value === false) {
    startkapitalDetails.value = true;
    iconStartkapital.value = "mdi-chevron-up";
  } else {
    startkapitalDetails.value = false;
    iconStartkapital.value = "mdi-chevron-down";
  }
}

function toggleSparplan() {
  if (sparplanDetails.value === false) {
    sparplanDetails.value = true;
    iconSparplan.value = "mdi-chevron-up";
  } else {
    sparplanDetails.value = false;
    iconSparplan.value = "mdi-chevron-down";
  }
}

// change endpoint
function changeEndpoint() {
  if (entnahmeplaninput.endpoint === "saving-start-value") {
    if (startkapitalDetails.value === true) {
      toggleStartkapital();
    }
  }
}

// get form data (user input)
function emitData() {
  if(parseInt(entnahmeplaninput.oneTimeInvestment[0])<=0 && entnahmeplaninput.endpoint!="saving-start-value"){
    dialog.value=true;
    dialogText.value = "Der Betrag vom Startkapital muss grösser als 0 sein. Geben Sie bitte die Werte nochmal ein."
      
  }else if(parseInt(entnahmeplaninput.endValue)>=parseInt(entnahmeplaninput.oneTimeInvestment[0]) && entnahmeplaninput.endpoint!="capital" && entnahmeplaninput.endpoint!="saving-start-value"){
    dialog.value=true;
    dialogText.value = "Beim Sparplan kann das Endkapital nicht grösser als das Startkapital sein. Geben Sie bitte die Werte nochmal ein oder wechseln Sie bitte zum Entnahmeplan."
  }
  else 
  {
    const toSend = JSON.parse(JSON.stringify(entnahmeplaninput));
    if (toSend.endpoint === "interest-rate" || toSend.endpoint === "end-date") {
      toSend.oneTimeInvestment = toSend.oneTimeInvestment.map(
          (investment) => -investment,
      );
      toSend.endValue === 0 ? (toSend.endValue = 0.01) : "";
    } else {
      toSend.savingRate = -toSend.savingRate;
    }
    validateInput(toSend);
    emit("calculateInput", toSend);
    }
}

watch(
    () => entnahmeplaninput.oneTimeInvestmentDate,
    () => {
      setEndDateToBiggestDate(entnahmeplaninput);
    },
    {deep: true},
);

watch(
    () => entnahmeplaninput.savingPlanEnd,
    () => {
      setEndDateToBiggestDate(entnahmeplaninput);
      if (
          new Date(entnahmeplaninput.savingPlanEnd) <
          new Date(entnahmeplaninput.savingPlanStart)
      )
        entnahmeplaninput.savingPlanEnd = entnahmeplaninput.savingPlanStart;
    },
);
watch(
    () => props.apiResponse,
    () => {
      switch (entnahmeplaninput.endpoint) {
        case "saving-start-value":
          entnahmeplaninput.oneTimeInvestment[0] = props.apiResponse.startInvestment;
          break;
        case "saving-rate":
          entnahmeplaninput.savingRate = props.apiResponse.savingRate;
          break;
        case "interest-rate":
          entnahmeplaninput.interestRate = props.apiResponse.interestRate;
          break;
        case "end-date":
          entnahmeplaninput.end = props.apiResponse.end;
          break;
        case "capital":
          entnahmeplaninput.endValue = props.apiResponse.capitalResult.capitalAmount;
          break;
      }
    },
);

watch(entnahmeplaninput,
()=>{
  if(new Date(entnahmeplaninput.end)<new Date(entnahmeplaninput.savingPlanEnd)){
    entnahmeplaninput.savingPlanEnd=entnahmeplaninput.end;
  }else{
    if(entnahmeplaninput.savingPlanEnd===inTenYears){

    }
  }
}
)
</script>

<template>
  <!-- headline -->
  <h1 class="flex justify-center pt-5 pb-2 font-bold">{{ $t("fieldNames.title") }}</h1>
  <!-- form container -->
  <v-form>
    <div>
      <v-card  elevation="0">
        <v-chip-group
            v-model="entnahmeplaninput.endpoint"
            @update:model-value="changeEndpoint"
            selected-class="bg-primary"
            class="overflow-hidden"
            mandatory
        >
          <v-container class="px-0 py-0">

            <!-- starting value radio button -->

            <v-row class="mt-0 ps-5">
              <v-col cols="12" class="flex px-0 py-0">
                <v-chip
                    value="saving-start-value"
                    density="compact"
                >{{ $t("fieldNames.startInvestment") }}</v-chip>
              </v-col>
            </v-row>

            <!-- starting value form -->
            <v-row class="ps-5 pe-2">
              <v-col
                  cols="11"
                  :sm="startkapitalDetails ? 6 : 11"
                  class="flex pe-2 px-0 order-1"
              >
                <!-- starting value response slot -->
                <v-text-field
                    v-if="entnahmeplaninput.endpoint == 'saving-start-value'"
                    variant="outlined"
                    density="compact"
                    :prefix="$t('currency')"
                    v-model="entnahmeplaninput.oneTimeInvestment[0]"
                    :value="props.apiResponse ? props.apiResponse.startInvestment : ''"
                    hide-details
                    readonly
                    bg-color="#E3F1F4"
                    color="primary"
                    base-color="primary"
                ></v-text-field>
                <!-- starting value input field -->
                <v-text-field
                    v-else
                    :label="'1. '+ $t('fieldNames.oneTimeInvestment')"
                    variant="outlined"
                    density="compact"
                    :prefix="$t('currency')"
                    v-model="entnahmeplaninput.oneTimeInvestment[0]"
                    required
                    hide-details
                    type="number"
                    step="1000"
                    :disabled="entnahmeplaninput.endpoint == ''"
                ></v-text-field>
                <!-- starting value info button -->
                <v-btn
                    icon
                    elevation="0"
                    variant="plain"
                    height="auto"
                    width="auto"
                    class="ps-2"
                >
                  <v-icon size="small">mdi-information-outline</v-icon>
                  <v-tooltip activator="parent" location="end" class="w-50">
                    {{ $t('fieldInfosSaving.startCapital') }}
                  </v-tooltip>
                </v-btn>

              </v-col>

              <!-- starting value date input field -->
              <v-col
                  v-if="startkapitalDetails"
                  cols="11"
                  sm="5"
                  class="flex ps-0 pe-2 order-3 order-sm-2"
              >
                <v-text-field
                    :label="$t('fieldNames.begin')"
                    variant="outlined"
                    density="compact"
                    v-model="entnahmeplaninput.oneTimeInvestmentDate[0]"
                    hide-details
                    type="date"
                    :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'saving-start-value'
                  "
                ></v-text-field>

                <!-- info button for starting value date -->
                <v-btn
                    icon
                    elevation="0"
                    variant="plain"
                    height="auto"
                    width="auto"
                    class="ps-2"
                >
                  <v-icon size="small">mdi-information-outline</v-icon>
                  <v-tooltip activator="parent" location="end" class="w-50">
                    {{ $t('fieldInfosWithdraw.startDate') }}</v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="1" class="px-0 flex align-center justify-center order-2 order-sm-3">
                <!-- starting value toggle button -->
                <v-icon v-if="entnahmeplaninput.endpoint!='saving-start-value'" size="large"
                        @click="toggleStartkapital">{{
                    iconStartkapital
                  }}
                </v-icon>
              </v-col>
            </v-row>

            <!-- starting value details form -->
            <v-row
                v-if="startkapitalDetails"
                v-for="n in einmalZahlung"
                class="ps-5 pe-2"
            >
              <v-col cols="11" sm="6" class="flex pe-2 px-0">

                <!-- one time investment input field -->
                <v-text-field
                    :prefix="$t('currency')"
                    :label="`${n + 1}. `+$t('fieldNames.oneTimeInvestment')"
                    variant="outlined"
                    density="compact"
                    v-model="entnahmeplaninput.oneTimeInvestment[n]"
                    hide-details
                    placeholder="weitere Einmalzahlung"
                    type="number"
                    step="1000"
                    :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'saving-start-value'
                  "
                ></v-text-field>
                <!-- info button for one time investment -->
                <v-btn
                    icon
                    elevation="0"
                    variant="plain"
                    height="auto"
                    width="auto"
                    class="ps-2"
                >
                  <v-icon size="small">mdi-information-outline</v-icon>
                  <v-tooltip activator="parent" location="end" class="w-50">
                    {{ $t('fieldInfosSaving.oneTimeInvestment') }}
                  </v-tooltip>
                </v-btn>
              </v-col>

              <!-- one time investment date input field -->
              <v-col
                  cols="11"
                  sm="5"
                  class="flex ps-0 pe-2"
              >
                <v-text-field
                    :label="`${n + 1}. `+$t('fieldNames.oneTimeInvestmentDate')"
                    variant="outlined"
                    density="compact"
                    v-model="entnahmeplaninput.oneTimeInvestmentDate[n]"
                    hide-details
                    type="date"
                    :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'saving-start-value'
                  "
                ></v-text-field>
                <!-- info button for one time investment date -->
                <v-btn
                    icon
                    elevation="0"
                    variant="plain"
                    height="auto"
                    width="auto"
                    class="ps-2"
                >
                  <v-icon size="small">mdi-information-outline</v-icon>
                  <v-tooltip activator="parent" location="end" class="w-50">
                    {{ $t('fieldInfosSaving.oneTimeInvestmentDate') }}
                  </v-tooltip>
                </v-btn>
              </v-col>

              <!-- button to delete one time investment -->
              <v-col
                  cols="1"
                  class="px-0 flex align-center justify-center"
              >
                <v-icon
                    @click="
                    () => {
                      einmalZahlung > 0 ? einmalZahlung-- : (einmalZahlung = 0);
                      entnahmeplaninput.oneTimeInvestment.pop();
                      entnahmeplaninput.oneTimeInvestmentDate.pop();
                    }
                  "
                    :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'saving-start-value' ||
                    einmalZahlung <= 0
                  "
                >
                  mdi-trash-can-outline
                </v-icon>
              </v-col>
            </v-row>

            <!-- button for new one time investment -->
            <v-row v-if="startkapitalDetails" class="ps-5 pe-2 pb-2">
              <v-col cols="auto" class=" px-0 py-0">
                <v-btn
                    @click="() => einmalZahlung++"
                    :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'saving-start-value'
                  "
                    rounded="lg"
                    variant="tonal"
                    color="#4195AC"
                    :text="$t('fieldNames.newOneTimeInvestment')"
                    prepend-icon="mdi-plus-circle-outline"
                    class="text-none"
                >
                </v-btn>
              </v-col>
            </v-row>

            <!-- withdrawal rate radio button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-chip
                    value="saving-rate"
                    density="compact"
                >{{ $t("fieldNames.withdrawRate") }}</v-chip>
              </v-col>
            </v-row>

            <!-- withdrawal rate form -->

            <v-row class="ps-5 pe-2">

              <v-col cols="11"  class="flex pe-2 px-0">
                <!-- withdrawal rate response slot -->
                <v-text-field
                    v-if="entnahmeplaninput.endpoint == 'saving-rate'"
                    variant="outlined"
                    :prefix="$t('currency')"
                    density="compact"
                    v-model="entnahmeplaninput.savingRate"
                    :value="props.apiResponse ? props.apiResponse.savingRate : ''"
                    readonly
                    required
                    hide-details
                    bg-color="#E3F1F4"
                    color="primary"
                    base-color="primary"
                ></v-text-field>
                <!-- withdrawal rate input field -->
                <v-text-field
                    v-else
                    variant="outlined"
                    :prefix="$t('currency')"
                    density="compact"
                    v-model="entnahmeplaninput.savingRate"
                    required
                    hide-details
                    :placeholder="$t('fieldNames.withdrawRate')"
                    type="number"
                    step="50"
                    :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'saving-rate'
                  "
                ></v-text-field>
                <!-- info button for withdrawal rate -->
                <v-btn
                    icon
                    elevation="0"
                    variant="plain"
                    height="auto"
                    width="auto"
                    class="ps-2"
                >
                  <v-icon size="small">mdi-information-outline</v-icon>
                  <v-tooltip activator="parent" location="end" class="w-50">
                    {{ $t('fieldInfosWithdraw.savingRate') }}
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="1" class="px-0 flex justify-center align-center" >
                <!-- toggle for withdrawal rate details -->
                <v-icon v-if="entnahmeplaninput.endpoint!='saving-rate'"  size="large" @click="toggleSparplan">{{
                    iconSparplan
                  }}
                </v-icon>
              </v-col>
            </v-row>

            <!-- withdrawal rate details form -->
            <v-row class="ps-5 pe-2" v-if="sparplanDetails">
              <v-col cols="11" sm="6" class="flex pe-2 px-0">

                <!-- starting date of withdrawal input field -->
                <v-text-field
                    :label="$t('fieldNames.begin')"
                    variant="outlined"
                    density="compact"
                    v-model="entnahmeplaninput.savingPlanBegin"
                    hide-details
                    type="date"
                    :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'saving-rate'
                  "
                ></v-text-field>
                <!-- info button for starting date of withdrawal -->
                <v-btn
                    icon
                    elevation="0"
                    variant="plain"
                    height="auto"
                    width="auto"
                    class="ps-2"
                >
                  <v-icon size="small">mdi-information-outline</v-icon>
                  <v-tooltip activator="parent" location="end" class="w-50">
                    {{ $t('fieldInfosWithdraw.savingPlanStart') }}
                  </v-tooltip>
                </v-btn>
              </v-col>


              <v-col
                  cols="11"
                  sm="5"
                  class="flex ps-0 pe-2"
              >
                <!-- input field for end date of withdrawal rate -->
                <v-text-field
                    :label="$t('fieldNames.end')"
                    variant="outlined"
                    density="compact"
                    v-model="entnahmeplaninput.savingPlanEnd"
                    hide-details
                    type="date"
                    min="sparplan"
                    :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'saving-rate'
                  "
                ></v-text-field>
                <!-- info button for end date of withdrawal rate -->
                <v-btn
                    icon
                    elevation="0"
                    variant="plain"
                    height="auto"
                    width="auto"
                    class="ps-2"
                >
                  <v-icon size="small">mdi-information-outline</v-icon>
                  <v-tooltip activator="parent" location="end" class="w-50">
                    {{ $t('fieldInfosWithdraw.savingPlanEnd') }}
                  </v-tooltip>
                </v-btn>
              </v-col>

              <!-- dynamic withdrawal rate factor -->
            </v-row>
            <v-row class="ps-5 pe-2" v-if="sparplanDetails">
              <v-col cols="auto" class="flex px-0 align-center">
                <!-- checkbox for dynamic rate factor -->
                <v-radio-group v-model="dynamik" hide-details>
                  <v-checkbox
                    :label="$t('fieldNames.dynamicSavingRateFactor')"
                      density="compact"
                      hide-details=""
                      :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'saving-rate'
                  "
                  ></v-checkbox>
                </v-radio-group>
              </v-col>

              <!-- input field for dynamic rate factor -->
              <v-col v-if="dynamik" class="flex px-2">
                <v-text-field
                    variant="outlined"
                    suffix="%"
                    density="compact"
                    v-model="entnahmeplaninput.dynamicSavingRateFactor"
                    hide-details
                    type="number"
                    step="0.5"
                ></v-text-field>
                <!-- info button for dynamic rate factor -->
                <v-btn
                    icon
                    elevation="0"
                    variant="plain"
                    height="auto"
                    width="auto"
                    class="ps-2"
                >
                  <v-icon size="small">mdi-information-outline</v-icon>
                  <v-tooltip activator="parent" location="end" class="w-50">
                    {{ $t('fieldInfosWithdraw.dynamicFactor') }}
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="1"></v-col>
            </v-row>

            <!-- interest rate radio button -->
            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-chip
                    disabled
                    value="interest-rate"
                    density="compact"
                >{{ $t("fieldNames.interestRate") }}</v-chip>
              </v-col>
            </v-row>

            <!-- interest rate Form -->

            <v-row class="ps-5 pe-2">
              <v-col class="flex pe-2 px-0">

                <!-- interest rate response slot -->
                <v-text-field
                    v-if="entnahmeplaninput.endpoint == 'interest-rate'"
                    prefix="%"
                    variant="outlined"
                    density="compact"
                    v-model="entnahmeplaninput.interestRate"
                    :value="props.apiResponse ? props.apiResponse.interestRate : ''"
                    required
                    readonly
                    hide-details
                    bg-color="#E3F1F4"
                    color="primary"
                    base-color="primary"
                ></v-text-field>

                <!-- interest rater input field -->
                <v-text-field
                    v-else
                    prefix="%"
                    variant="outlined"
                    density="compact"
                    v-model="entnahmeplaninput.interestRate"
                    required
                    hide-details
                    :placeholder="$t('fieldNames.interestRate')"
                    type="number"
                    step="0.5"
                    :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'interest-rate'
                  "
                ></v-text-field>

                <!-- info button for interest rate -->
                <v-btn
                    icon
                    elevation="0"
                    variant="plain"
                    height="auto"
                    width="auto"
                    class="ps-2"
                >
                  <v-icon size="small">mdi-information-outline</v-icon>
                  <v-tooltip activator="parent" location="end" class="w-50">
                    {{ $t('fieldInfosWithdraw.interestRate') }}
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="1"></v-col>
            </v-row>


            <!-- end date radio button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-chip
                    value="end-date"
                    density="compact"
                >{{ $t("fieldNames.end") }}</v-chip>
              </v-col>
            </v-row>

            <!-- end date Form -->
            <v-row class="ps-5 pe-2">
              <v-col class="flex pe-2 px-0">

                <!-- end date response slot -->
                <v-text-field
                    v-if="entnahmeplaninput.endpoint == 'end-date'"
                    variant="outlined"
                    density="compact"
                    v-model="entnahmeplaninput.end"
                    :value="props.apiResponse ? props.apiResponse.end : ''"
                    required
                    readonly
                    hide-details
                    type="date"
                    bg-color="#E3F1F4"
                    color="primary"
                    base-color="primary"
                ></v-text-field>

                <!-- end date input field -->
                <v-text-field
                    v-else
                    variant="outlined"
                    density="compact"
                    v-model="entnahmeplaninput.end"
                    required
                    hide-details
                    type="date"
                    :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'end-date'
                  "
                ></v-text-field>

                <!-- info button for end date -->
                <v-btn
                    icon
                    elevation="0"
                    variant="plain"
                    height="auto"
                    width="auto"
                    class="ps-2"
                >
                  <v-icon size="small">mdi-information-outline</v-icon>
                  <v-tooltip activator="parent" location="end" class="w-50">
                    {{ $t('fieldInfosWithdraw.endDate') }}
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="1"></v-col>
            </v-row>

            <!-- capital radio button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-chip
                    value="capital"
                    density="compact"
                >{{ $t("fieldNames.capitalAmount") }}</v-chip>
              </v-col>
            </v-row>

            <!-- capital form -->

            <v-row class="ps-5 pe-2 pb-5">
              <v-col class="flex pe-2 px-0" cols="11">

                <!-- capital response slot -->
                <v-text-field
                    v-if="entnahmeplaninput.endpoint == 'capital'"
                    variant="outlined"
                    :prefix="$t('currency')"
                    density="compact"
                    v-model="entnahmeplaninput.endValue"
                    :value="props.apiResponse
                            ? props.apiResponse.capitalResult
                                ? props.apiResponse.capitalResult.capitalAmount
                                : '' : ''"
                    readonly
                    hide-details
                    bg-color="#E3F1F4"
                    color="primary"
                    base-color="primary"
                ></v-text-field>

                <!-- capital input field -->
                <v-text-field
                    v-else
                    variant="outlined"
                    :prefix="$t('currency')"
                    density="compact"
                    v-model="entnahmeplaninput.endValue"
                    type="number"
                    step="1000"
                    hide-details
                    :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'capital'
                  "
                ></v-text-field>

                <!-- info button for capital -->
                <v-btn
                    icon
                    elevation="0"
                    variant="plain"
                    height="auto"
                    width="auto"
                    class="ps-2"
                >
                  <v-icon size="small">mdi-information-outline</v-icon>
                  <v-tooltip activator="parent" location="end" class="w-50">
                    {{ $t('fieldInfosWithdraw.endValue') }}
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="1"></v-col>
            </v-row>
          </v-container>
        </v-chip-group>
      </v-card>

      <!-- calculate button -->
      <v-btn
          block
          class="text-none rounded-lg"
          color="#16486B"
          size="x-large"
          variant="flat"
          @click="emitData"
      >
      {{ $t('fieldNames.calculate') }}
      </v-btn>
    </div>
  </v-form>
  <v-dialog v-model="dialog" width="auto">
      <v-card>
        <v-card-title>
          {{ $t('dialog.message') }}
        </v-card-title>
        <v-card-text v-text="dialogText"></v-card-text>
        <v-card-actions>
          <v-btn color="primary" block @click="dialog = false"
            >{{ $t('dialog.close') }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>


<style scoped></style>
