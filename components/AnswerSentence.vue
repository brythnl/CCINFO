<script setup lang="ts">

export interface Output{
    capitalAmount: number,
    savingRate: number,
    startInvestment: number,
    interestRate: number,
    end: string,
}
const years:number = ref(7)

const props = defineProps<{
 output:{
    capitalAmount: number,
    savingRate: number,
    startInvestment: number,
    interestRate: number,
    end: string,
 },
 currency: string,
 endpoint: string,
 scenario: string,
 startDate: string,
 seperator: string
}>()

const formattedOutput = reactive({
    capitalAmount: '',
    savingRate: 0,
    startInvestment: 0,
    interestRate: 0,
    end: '',
})

let isActive=[false, false, false, false, false];

function calculateTimeDifference(dateString1, dateString2) {
  const date1 = new Date(dateString1);
  const date2 = new Date(dateString2);

  const timeDifference = Math.abs(date2 - date1);

  const millisecondsInYear = 1000 * 60 * 60 * 24 * 365.25; // Considering leap years
  const yearsDifference = timeDifference / millisecondsInYear;

  return Math.floor(yearsDifference);
}

function formatOutput(output:Output){
    formattedOutput.savingRate = output.savingRate > 0 ? addThousandSeparator(props.output.savingRate, props.seperator) : addThousandSeparator(props.output.savingRate *-1, props.seperator);
    formattedOutput.capitalAmount = addThousandSeparator(output.capitalAmount, props.seperator);
    formattedOutput.startInvestment = addThousandSeparator(output.startInvestment, props.seperator);
    formattedOutput.interestRate = output.interestRate
    formattedOutput.end = formatDate(output.end)

    console.log(output.capitalAmount);

}

function formatDate(inputDateStr: string) {
  // Parse the input date
  const inputDate = new Date(inputDateStr);

  // Extract day, month, and year
  const day = inputDate.getDate();
  const month = inputDate.getMonth() + 1; // Month is zero-based, so add 1
  const year = inputDate.getFullYear();

  // Create the formatted date string
  return `${day  < 10 ? '0' : ''}${day}.${month < 10 ? '0' : ''}${month}.${year}`;
}

function addThousandSeparator(amount:number, separator:string) {
  // Convert the number to a string and split the integer and decimal parts
  console.log(typeof amount);
  if (typeof amount == 'undefined') {
    return 0;
  }else
  {
    const parts = amount.toString().split('.');
    // Add thousand separators to the integer part
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);

    // Join the integer and decimal parts with the separator if the number has a decimal part
    return  parts.join('.');

  }

}

function highlightSetence(endpoint: string){
    switch (props.endpoint){
        case 'saving-rate':{
            isActive[0]= true;
          break;
        }
        case 'interest-rate':{
            isActive[1]= true;
            break;
        }
        case 'saving-start-value':{
            isActive[2]= true;
            break;
        }
        case 'end-date':{
            isActive[3]= true;
            break;
        }
        case 'capital':{
            isActive[4]= true;
            break;
        }
    }
}

onMounted(()=>{
    formatOutput(props.output)
    highlightSetence(props.endpoint)
    years.value=calculateTimeDifference(props.startDate, props.output.end)
})

watch(()=>props.endpoint, ()=>{
    isActive.forEach((item, i)=>{isActive[i] = false})
    highlightSetence(props.endpoint)
    years.value=calculateTimeDifference(props.startDate, props.output.end)
})

watch(()=>props.output, ()=>{
    formatOutput(props.output)
    highlightSetence(props.endpoint)
    years.value=calculateTimeDifference(props.startDate, props.output.end)
})

</script>
<template>
    <div class="px-5">
      <h4 class="flex justify-center pt-5 pb-3 font-bold">Ihr Ergebnis</h4>
        <div v-if="scenario == 'saving'">
        <div v-if="isActive[0]">
            Wenn Sie monatlich
            <span :class="{'font-weight-bold': isActive[0]}">{{ formattedOutput.savingRate }}{{ currency }}</span>
            zu 
            <span :class="{'font-weight-bold': isActive[1]}">{{ formattedOutput.interestRate }}%Zinsen</span><br>
            über {{ years }} Jahre
            <span :class="{'font-weight-bold': isActive[3]}">({{ formattedOutput.end }})</span>
            anlegen,<br> kommen Sie auf ein Endkapital von 
            <span :class="{'font-weight-bold': isActive[4]}">{{ formattedOutput.capitalAmount }}{{ currency }}.</span><br>
            Sie investieren am {{ formatDate(startDate) }}
            <span :class="{'font-weight-bold': isActive[2]}">{{ formattedOutput.startInvestment }}{{ currency }}</span>.
        </div>

        <div v-if="isActive[1]">
            Wenn Sie zu 
            <span :class="{'font-weight-bold': isActive[1]}">{{ formattedOutput.interestRate }}%</span> Zinsen
            monatlich
            <span :class="{'font-weight-bold': isActive[0]}">{{ formattedOutput.savingRate }}{{ currency }}</span><br>
            über {{ years }} Jahre
            <span :class="{'font-weight-bold': isActive[3]}">({{ formattedOutput.end }})</span>
            anlegen,<br> kommen Sie auf ein Endkapital von 
            <span :class="{'font-weight-bold': isActive[4]}">{{ formattedOutput.capitalAmount }}{{ currency }}.</span><br>
            Sie investieren am {{ formatDate(startDate) }}
            <span :class="{'font-weight-bold': isActive[2]}">{{ formattedOutput.startInvestment }}{{ currency }}</span>.
        </div>

        <div v-if="isActive[2]">
            Sie müssen am {{ formatDate(startDate) }}
            <span :class="{'font-weight-bold': isActive[2]}">{{ formattedOutput.startInvestment }}{{ currency }}</span> investieren.<br>
            Wenn sie nun über  {{ years }} Jahre
            <span :class="{'font-weight-bold': isActive[3]}">({{ formattedOutput.end }})</span><br>
            monatlich 
            <span :class="{'font-weight-bold': isActive[0]}">{{ formattedOutput.savingRate }}{{ currency }}</span>
            zu 
            <span :class="{'font-weight-bold': isActive[1]}">{{ formattedOutput.interestRate }}%</span> Zinsen
            anlegen,<br> kommen Sie auf ein Endkapital von 
            <span :class="{'font-weight-bold': isActive[4]}">{{ formattedOutput.capitalAmount }}{{ currency }}</span>.
        </div>

        <div v-if="isActive[3]">
            Wenn Sie über  {{ years }} Jahre
            <span :class="{'font-weight-bold': isActive[3]}">({{ formattedOutput.end }})</span><br>
            monatlich 
            <span :class="{'font-weight-bold': isActive[0]}">{{ formattedOutput.savingRate }}{{ currency }}</span>
            zu 
            <span :class="{'font-weight-bold': isActive[1]}">{{ formattedOutput.interestRate }}%</span> Zinsen
            anlegen, <br>kommen Sie auf ein Endkapital von 
            <span :class="{'font-weight-bold': isActive[4]}">{{ formattedOutput.capitalAmount }}{{ currency }}</span>.
            <br>Sie investieren am {{ formatDate(startDate) }}
            <span :class="{'font-weight-bold': isActive[2]}">{{ formattedOutput.startInvestment }}{{ currency }}</span>.
        </div>

        <div v-if="isActive[4]">
            Sie kommen auf ein Endkapital von 
            <span :class="{'font-weight-bold': isActive[4]}">{{ formattedOutput.capitalAmount }}{{ currency }}</span>,<br>
            wenn Sie über {{ years }} Jahre
            <span :class="{'font-weight-bold': isActive[3]}">({{ formattedOutput.end }})</span><br>
            monatlich
            <span :class="{'font-weight-bold': isActive[0]}">{{ formattedOutput.savingRate }}{{ currency }}</span>
            zu 
            <span :class="{'font-weight-bold': isActive[1]}">{{ formattedOutput.interestRate }}%</span> Zinsen
            anlegen <br> und am 
            {{ formatDate(startDate) }}
            <span :class="{'font-weight-bold': isActive[2]}">{{ formattedOutput.startInvestment }}{{ currency }}</span> investieren.
        </div>
    </div>


    <div v-if="scenario =='withdraw'">
        <div v-if="isActive[4]">
            Sie haben noch
            <span :class="{'font-weight-bold': isActive[4]}">{{ formattedOutput.capitalAmount }}{{ currency }}</span> Ersparnisse
            nach {{ years }} Jahren 
            <span :class="{'font-weight-bold': isActive[3]}">({{ formattedOutput.end }})</span>,
            wenn Sie am {{ formatDate(startDate) }} mit einem Vermögen von
            <span :class="{'font-weight-bold': isActive[2]}">{{ formattedOutput.startInvestment }}{{ currency }}</span>
            starten und jeden Monat
            <span :class="{'font-weight-bold': isActive[0]}">{{ formattedOutput.savingRate }}{{ currency }}</span>
            zu 
            <span :class="{'font-weight-bold': isActive[1]}">{{ formattedOutput.interestRate }}%</span> Zinsen
            entnehmen.
        </div>

        <div v-if="isActive[0]">
            Sie dürfen jeden Monat
            <span :class="{'font-weight-bold': isActive[0]}">{{ formattedOutput.savingRate }}{{ currency }}</span>
            entnehmen,
            wenn sie ihr Startvermögen von
            <span :class="{'font-weight-bold': isActive[2]}">{{ formattedOutput.startInvestment }}{{ currency }}</span>
            zu 
            <span :class="{'font-weight-bold': isActive[1]}">{{ formattedOutput.interestRate }}% verzinsen.</span>
            Nach {{ years }} Jahren 
            <span :class="{'font-weight-bold': isActive[3]}">({{ formattedOutput.end }})</span>
            haben Sie noch
            <span :class="{'font-weight-bold': isActive[4]}">{{ formattedOutput.capitalAmount }}{{ currency }}</span>  Ersparnisse.
        </div>

        <div v-if="isActive[2]">
            Sie brauchen ein Startvermögen von
            <span :class="{'font-weight-bold': isActive[2]}">{{ formattedOutput.startInvestment }}{{ currency }}</span>,
            welches Sie zu 
            <span :class="{'font-weight-bold': isActive[1]}">{{ formattedOutput.interestRate }}% verzinsen,</span>
            um jeden Monat 
            <span :class="{'font-weight-bold': isActive[0]}">{{ formattedOutput.savingRate }}{{ currency }}</span>
            entnehmen zu können.
            Nach {{ years }} Jahren 
            <span :class="{'font-weight-bold': isActive[3]}">({{ formattedOutput.end }})</span>
            haben Sie noch
            <span :class="{'font-weight-bold': isActive[4]}">{{ formattedOutput.capitalAmount }}{{ currency }}</span>  Ersparnisse.
        </div>

        <div v-if="isActive[1]">
            Sie müssen ihr Startvermögen von
            <span :class="{'font-weight-bold': isActive[2]}">({{ formattedOutput.startInvestment }} {{ currency }})</span>
            zu 
            <span :class="{'font-weight-bold': isActive[1]}">{{ formattedOutput.interestRate }}% verzinsen,</span>
            um jeden Monat 
            <span :class="{'font-weight-bold': isActive[0]}">{{ formattedOutput.savingRate }}{{ currency }}</span>
            entnehmen zu können.
            Nach {{ years }} Jahren 
            <span :class="{'font-weight-bold': isActive[3]}">({{ formattedOutput.end }})</span>
            haben Sie noch
            <span :class="{'font-weight-bold': isActive[4]}">{{ formattedOutput.capitalAmount }}{{ currency }}</span>  Ersparnisse.
        </div>

        <div v-if="isActive[3]">
            Sie können über {{ years }} Jahre bis zum
            <span :class="{'font-weight-bold': isActive[3]}">{{ formattedOutput.end }}</span>
            jeden Monat 
            <span :class="{'font-weight-bold': isActive[0]}">{{ formattedOutput.savingRate }}{{ currency }}</span>
            entnehmen, wenn Sie mit einem Vermögen von
            <span :class="{'font-weight-bold': isActive[2]}">{{ formattedOutput.startInvestment }}{{ currency }}</span>
            starten, welches Sie zu 
            <span :class="{'font-weight-bold': isActive[1]}">{{ formattedOutput.interestRate }}% verzinsen.</span>
            Ihnen bleiben
            <span :class="{'font-weight-bold': isActive[4]}">{{ formattedOutput.capitalAmount }}{{ currency }}</span>  Ersparnisse.
        </div>
    </div>
    </div>
</template>

<style scoped>
.fs-12{
    font-size: 1.2em;
}
</style>
