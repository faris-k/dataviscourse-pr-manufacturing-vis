//
//  CS6630 -- Equipment Visualization Workbench
//	Faris Khan, Filemon Mateus, Alan Weber
//

// var x1 = d3.select("#metadataModel");
// x1.on("click", (event, d) => {
// 	d3.selectAll(".grid-container-faris").remove();
// 	d3.selectAll("#grid-container-filemon").remove();
// 	this.callFilemonSelect();
// });
// var x2 = d3.select("#traceData");
// x2.on("click", (event, d) => {
// 	d3.selectAll(".grid-container-faris").remove();
// 	d3.selectAll("#grid-container-filemon").remove();
// 	this.callFarisSelect();
// });
// var x3 = d3.select("#eventData");
// x3.on("click", (event, d) => {
// 	d3.selectAll(".grid-container-faris").remove();
// 	d3.selectAll("#grid-container-filemon").remove();
// 	this.callAlanSelect();
// });

// var x4 = d3.select("#editModel");
// x4.on("click", (event, d) => {
// 	d3.selectAll(".grid-container-faris").remove();
// 	d3.selectAll("#grid-container-filemon").remove();
// 	this.callFilemonEdit();
// });
// var x5 = d3.select("#editTrace");
// x5.on("click", (event, d) => {
// 	d3.selectAll(".grid-container-faris").remove();
// 	d3.selectAll("#grid-container-filemon").remove();
// 	this.callFarisEdit();
// });
// var x6 = d3.select("#editEvent");
// x6.on("click", (event, d) => {
// 	d3.selectAll(".grid-container-faris").remove();
// 	d3.selectAll("#grid-container-filemon").remove();
// 	this.callAlanEdit();
// });

var x7 = d3.select("#vizModel");
x7.on("click", (event, d) => {
	d3.selectAll(".grid-container-faris").remove();
	d3.selectAll("#grid-container-filemon").remove();
	emptyAlanDivs();
	this.callFilemonViz();
});
var x8 = d3.select("#vizTrace");
x8.on("click", (event, d) => {
	// Here, we create dynamic data visualizations (Faris); remove other divs here!
	emptyAlanDivs();
	this.callFarisViz();
});
var x9 = d3.select("#vizEvent");
x9.on("click", (event, d) => {
	d3.selectAll(".grid-container-faris").remove();
	d3.selectAll("#grid-container-filemon").remove();
	this.callAlanSelect();
	this.callAlanViz();
});

console.log("In script.js... waiting for something to happen...");

var toolTip = d3
	.select("#tipTitle")
	.style("position", "absolute")
	.style("visibility", "invisible")
	.attr("class", "tooltip")
	.style("padding-left", "10px")
	.style("padding-right", "10px")
	.style("border", "1px solid #969696")
	.style("text-align", "center")
	.style("font-weight", 700)
	.style("background", "yellow")
	.style("fill", "black")
	.style("opacity", 0)
	.text("placeholder tooltip text");

function callAlanSelect() {
	let substrateData = d3.csv("./EventData/VIZ_Substrate_Timing_01.csv");
	let sequenceData = d3.csv("./EventData/VIZ_Substrate_Sequence_00.csv");
	let recipeData = d3.csv("./EventData/VIZ_Recipe_Timing_01.csv");

	Promise.all([substrateData, sequenceData, recipeData]).then((data) => {
		this.rawSubstrateEventData = data[0];
		this.rawSequenceEventData = data[1];
		this.rawRecipeEventData = data[2];
		console.log(
			"Substrate Timing Event data = ",
			this.rawSubstrateEventData
		);
		console.log(
			"Substrate Sequence Event data = ",
			this.rawSequenceEventData
		);
		console.log("Recipe data = ", this.rawRecipeEventData);
		window.viewSequence = false;
	});
}

function callAlanEdit() {
	console.log("callAlanEdit");
}

function callAlanViz() {
	console.log("callAlanViz");
	d3.selectAll(".grid-container-faris").remove();
	d3.selectAll("#grid-container-filemon").remove();
	var x9a = d3.select("#eventRadio-1");
	x9a.on("click", (event, d) => {
		this.callNodeTiming();
		return;
	});
	var x9b = d3.select("#eventRadio-2");
	x9b.on("click", (event, d) => {
		this.callNodeSequence();
	});
	var x9c = d3.select("#eventRadio-3");
	x9c.on("click", (event, d) => {
		this.callRecipeTiming();
	});
	return;
}

function callNodeTiming() {
	console.log("callNodeTiming");
	d3.selectAll(".grid-container-faris").remove();
	d3.selectAll("#grid-container-filemon").remove();
	this.nodeBarChart = new NodeTiming(this.rawSubstrateEventData);
	console.log("nodeBarChart = ", this.nodeBarChart);
	this.nodeBarChart.drawNodeBarChart();
}

function callNodeSequence() {
	console.log("callNodeSequence");
	d3.selectAll(".grid-container-faris").remove();
	d3.selectAll("#grid-container-filemon").remove();
	this.nodeSeq = new NodeSequence(this.rawSequenceEventData);
	console.log("nodeSeq = ", this.nodeSeq);
	//	this.nodeSeq.drawNodeGraph();
}

function callRecipeTiming() {
	console.log("callRecipeTiming");
	d3.selectAll(".grid-container-faris").remove();
	d3.selectAll("#grid-container-filemon").remove();
	this.recipeBarChart = new RecipeTiming(this.rawRecipeEventData);
	console.log("nodeBarChart = ", this.recipeBarChart);
	this.recipeBarChart.drawRecipeBarChart();
}

function callFilemonSelect() {
	console.log("callFilemonSelect");
}
function callFilemonEdit() {
	console.log("callFilemonEdit");
}

function callFilemonViz() {
	d3.selectAll("#grid-container-filemon").remove();
	let container = d3.select("#rightPane");
	initStaticDataViewer(container);
	d3.selectAll("div#tipNode").data([0]).join("div#tipNode");
	d3.selectAll("div#vizTitle").data([0]).join("div#vizTitle");
	d3.selectAll("div#nodetiming-div").data([0]).join("div#nodetiming-div");
}

function callFarisSelect() {
	console.log("callFarisSelect");
}
function callFarisEdit() {
	console.log("callFarisEdit");
}

function emptyAlanDivs() {
	d3.select("#vizTitle").html(null);
	d3.select("#nodetiming-div").html(null);
	d3.select("#tipNode").html(null);
	d3.select("#nodesequence-div").html(null);
	d3.select("#recipetiming-div").html(null);
}

function callFarisViz() {
	d3.selectAll("#grid-container-filemon").remove();
	// ******* DATA LOADING *******
	async function loadData() {
		const traceData = await d3.json("./TraceData/dummy_traces.json");

		return { traceData };
	}

	// ******* STATE MANAGEMENT *******
	const globalApplicationState = {
		traceData: null,
		bounds: null,
		selectedVars: [],
	};

	//******* APPLICATION MOUNTING *******
	loadData().then((loadedData) => {
		console.log("Here is the imported data:", loadedData);
		globalApplicationState.traceData = loadedData.traceData.data;

		// Data preprocessing: turn dates into Date objects
		let total = 0;
		globalApplicationState.traceData.forEach(function (row) {
			// Note: Date Object may appear same for multiple rows since milliseconds aren't displayed
			// Calling getTime() confirms that the Date (timestep) is unique for each row
			row.Time = new Date(row.Time);
		});

		let traceDIV = d3
			.select("#rightPane")
			.append("div")
			.classed("grid-container-faris", true);
		traceDIV.append("div").attr("id", "button-div").classed("item11", true);
		traceDIV
			.append("div")
			.attr("id", "linechart-div")
			.classed("item22", true);
		traceDIV.append("div").attr("id", "splom-div").classed("item33", true);

		const linechart = new LineChart(globalApplicationState);
		const splom = new ScatterplotMatrix(globalApplicationState);

		const allVar = Object.keys(globalApplicationState.traceData[0])
			.filter((d) => d.includes("Scaled"))
			.map((d) => d.slice(0, d.indexOf("_")));

		allVar.forEach((d) => globalApplicationState.selectedVars.push(d));

		d3.select(".accordion-body")
			.append("button")
			.attr("type", "button")
			.classed("btn", true)
			.classed("btn-primary", true)
			.text("Redraw Scatterplot Matrix")
			.on("click", function (event, d) {
				d3.selectAll(".cell").remove();

				let filterBounds = globalApplicationState.bounds;
				let filterData = globalApplicationState.traceData.filter(
					(d) =>
						d.Time >= filterBounds[0] && d.Time <= filterBounds[1]
				);

				splom.drawCells(
					globalApplicationState.selectedVars,
					filterData
				);
			});
	});
}
