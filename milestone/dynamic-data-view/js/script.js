// ******* DATA LOADING *******
async function loadData() {
	const traceData = await d3.json("./data/scaled_traces.json");

	const eventData = await d3.json("./data/events.json");
	return { traceData, eventData };
}

// ******* STATE MANAGEMENT *******
const globalApplicationState = {
	traceData: null,
	eventData: null,
};

//******* APPLICATION MOUNTING *******
loadData().then((loadedData) => {
	console.log("Here is the imported data:", loadedData);
	globalApplicationState.traceData = loadedData.traceData.data;
	globalApplicationState.eventData = loadedData.eventData.data;

	// Data preprocessing: turn dates into Date objects
	let total = 0;
	globalApplicationState.traceData.forEach(function (row) {
		// Note: Date Object may appear same for multiple rows since milliseconds aren't displayed
		// Calling getTime() confirms that the Date (timestep) is unique for each row
		row.Time = new Date(row.Time);
	});

	console.log(globalApplicationState.traceData);

	const linechart = new LineChart(globalApplicationState);
	const splom = new ScatterplotMatrix(globalApplicationState);
});
