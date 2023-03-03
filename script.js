var monthSelect = document.getElementById('month'),
	daySelect = document.getElementById('day'),
	counter = document.getElementById('counter'),
	includeSelected = document.getElementById('includeselected'),
	total = document.getElementById('total'),
	average = document.getElementById('average'),
	list = document.getElementById('list'),
	message = document.getElementById('message'),

	optionDay29 = document.getElementById('29'),
	optionDay30 = document.getElementById('30'),
	optionDay31 = document.getElementById('31'),
	daysInMonth = {'01': '31', '02': '28', '03': '31', '04': '30', '05': '31', '06': '30', 
'07': '31', '08': '31', '09': '30', '10': '31', '11': '30', '12': '31', },
	dateKey,

	today = new Date()												// auto populate date
daySelect.value = toDoubleDigitString(today.getDate())
monthSelect.value = toDoubleDigitString(today.getMonth()+1)
monthSelected(monthSelect.value)

function toDoubleDigitString(num){
	if (num<10) { return '0' + num }
	return String(num)
}

function getTime(){
		var d = new Date(),
		hours24 = d.getHours(),
		suffix = hours24 >= 12 ? " PM":" AM",
		hours = ((hours24 + 11) % 12 + 1),
		minutes = d.getMinutes(),
		seconds = d.getSeconds()
		if (seconds<10) { seconds = '0'+seconds }
		if (minutes<10) { minutes = '0'+minutes }
return hours+':'+minutes+':'+seconds+suffix
	}

function logStandUp() {
	store('total', (store('total')+1))

	if (!store.has(dateKey)) { 		// if key doesn't exist
		store.set(dateKey, [{		// create new array with first stand up of the day
			dailyTotal : 1,
			time : getTime(),
			total : store.get('total')
		}])
		counter.textContent = 1
	}
	else {														// if key exists
		var lastStandUpObject = store.get(dateKey)[0],
		newStandUpObject = {
		dailyTotal : lastStandUpObject.dailyTotal + 1,
		time : getTime(),
		total : store.get('total')
		},
		newStandUpArray = store.get(dateKey)
		newStandUpArray.unshift(newStandUpObject)
		store(dateKey, newStandUpArray)						// add new stand up to beginning of array
		counter.textContent = newStandUpObject.dailyTotal
	}
	getInfo()
}

function monthSelected(month) {					// show or hide number of days depending on month
	if (daysInMonth[month] == 30) {
		optionDay30.hidden = false
		optionDay31.hidden = true
	}
	else if (daysInMonth[month] == 31) {
		optionDay30.hidden = false
		optionDay31.hidden = false
		}
	else  {
		optionDay29.hidden = true
		optionDay30.hidden = true
		optionDay31.hidden = true
	}
	newDateSelected()
}
function newDateSelected() {
	dateKey = monthSelect.value+'/'+ daySelect.value +'/2023'
	getStandUps()
	getInfo()
}
function getStandUps(){
	if (!store.has('total')) { store('total', 0) }
	if (store.has(dateKey)) {
	counter.textContent = store.get(dateKey)[0].dailyTotal
	}
	else { counter.textContent = '0'}
}
function getInfo(){
	var endDateMonth = monthSelect.value,
		endDateDay = daySelect.value,
		startDateMonth,
		startDateDay,
		subtrahend = 6
	
	if (endDateMonth == '01' && (Number(endDateDay)<8)) { 	// stop if 7 days from selected precedes 2023
		average.textContent = 'N/A'
		return
		}
	if (!includeSelected.checked) {
		if (endDateDay == 1) {
			endDateMonth = '0' + (Number(endDateMonth)-1)
			endDateDay = daysInMonth[endDateMonth]	
		}
		else { endDateDay = '0' + (Number(endDateDay)-1) }	// get date of 7th day
		
	}
	if (Number(endDateDay)-subtrahend <= 0) {
		let remainingDifference = (Number(endDateDay)-subtrahend)
		startDateMonth = '0' + (Number(endDateMonth)-1)
		startDateDay = daysInMonth[startDateMonth] - Math.abs(remainingDifference)
	}
	else {											// get date of 1st day
		startDateMonth = endDateMonth
		startDateDay = Number(endDateDay)-subtrahend
		}
	
	var result = 0,
		currStandUpObject,
		loopDateMonth = startDateMonth,
		loopDateDay = startDateDay,
		loopDateKey,
		sumDailyTotals = 0,
		numDaysLogged = 0,
		i = 0
	while (i<7) {									// iterate through each day of 7 day window add sum of dailyTotal
		if (Number(loopDateDay)<10) { loopDateDay = '0' + loopDateDay }
		loopDateKey = loopDateMonth + '/' + loopDateDay + '/2023'
		if (store.has(loopDateKey)) {
			currStandUpObject = store.get(loopDateKey)[0]
			sumDailyTotals += currStandUpObject.dailyTotal
			numDaysLogged += 1
		}
		if (loopDateDay == daysInMonth[loopDateMonth]) {
			loopDateMonth = '0' + (Number(loopDateMonth)+1)
			loopDateDay = '1'
		}
		else { loopDateDay = (Number(loopDateDay)+1) }
		i++
	}
	
	result = sumDailyTotals / numDaysLogged
	
	if (!isNaN(result)) {
		result = Math.round(result * 100) / 100
		average.textContent = String(result)
	}
	else { average.textContent = 'N/A'}
	if (store.has('total')) { total.textContent = store('total') }
	getList()
}

function getList() {
	var currStandUpTime,
		result = '',
		standUpArray = store.get(dateKey),
		enumerator = 1
	if (!store.has(dateKey)) { list.innerHTML = ''; message.style.visibility = 'visible'; return }
	message.style.visibility = 'hidden'
	for (let i=standUpArray.length-1; i>=0; i--) {
		currStandUpTime = standUpArray[i].time
		result += String(enumerator)+'.&nbsp;&nbsp;&nbsp;&nbsp;'+String(currStandUpTime)+'<br>'
		enumerator += 1
	}
	list.innerHTML = result
}

function resetDay() {
	var prevTotal = store.get('total'),
		currDailyTotal = counter.textContent
	store.remove(dateKey)
	console.log(prevTotal)
	console.log(currDailyTotal)
	store('total', Number(prevTotal)-Number(currDailyTotal))
	getStandUps()
	getInfo()
}

$(document).ready(function() {
  
  $(window).scroll(function() {
    var scroll = $(window).scrollTop();
    if (scroll >= 0) {
      $('.arrow').addClass('fade');
    }
  })
});

