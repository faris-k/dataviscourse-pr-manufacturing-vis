/** Class implementing the Bar Chart for Node Visit Timing. */
class NodeTiming {
//
//   Creates a Node Visit Bar Chart for Manufacturing Equipment Project
//     
    constructor(eventData) {
		console.log("Entering nodeTiming...");
        this.eventData = eventData;
		
		this.svgWidth = 1100;
		this.chartWidth = 900;
		this.svgHeight = 1400;
		this.chartHeight = 600;
		this.xAxisHeight = 60;
		this.xAxisWidth = this.chartWidth;
		this.yAxisWidth = 150;
		this.yAxisHeight = this.chartHeight;
        this.vizHeight = 7;
		
		this.colorScale = d3.schemeSet1;
		this.margins = { top: 50, left: 20, right: 20, bottom: 50 }
		this.marginFactor = 0.9
		
		this.maxTime = Math.max(...this.eventData.map(o => o.CumulTime));
		console.log("maxTime = ", this.maxTime);
		this.maxEndTime = 0;
		
		this.locList = [];this.locUtilTimeList = [];
		this.matlList = [];
		this.vizEventList = [];
		this.newVizRec = {startTime:0, endTime:0, locIndex: -1, materialID: ""};
		this.materialLocData = [{startTime:50, endTime:80, locIndex:1, materialID:"CARRIER2:01"},
								{startTime:60, endTime:100, locIndex: 0, materialID:"CARRIER2:02"},
								{startTime:60, endTime:100, locIndex: 2, materialID:"CARRIER2:02"},
								{startTime:160, endTime:200, locIndex: 0, materialID:"CARRIER2:02"},
								{startTime:60, endTime:100, locIndex: 3, materialID:"CARRIER2:02"}];
		this.materialLocData = [];
//
//  Include only Carrier2 substrates
//
		this.numEventRecs = this.eventData.length;
		for (let i = 0; i < this.numEventRecs; i++) {
			let loc = this.eventData[i].CimetrixGEM300Simulation_MaterialManager_SubstLocID;
			if  (! this.locList.includes(loc) && loc.slice(0,7) != "CARRIER") {
				this.locList.push(loc);
				this.locUtilTimeList.push(0);
			}
			let matl = this.eventData[i].CimetrixGEM300Simulation_MaterialManager_SubstLocSubstID;
			if (! this.matlList.includes(matl) && matl != "" && matl.slice(0,8) != "CARRIER1") {
				this.matlList.push(matl);
			}
		}
		console.log ("Substrate location list =  ", this.locList.length, this.locList);
		console.log("Material list = ", this.matlList.length, this.matlList);	
	
//
//  Generate substrate node location visit list 
//	
	
		for (let i = 0; i < this.eventData.length; i++) {
			if (this.locList.includes(this.eventData[i].CimetrixGEM300Simulation_MaterialManager_SubstLocID) &&
				this.matlList.includes(this.eventData[i].CimetrixGEM300Simulation_MaterialManager_SubstLocSubstID))   
			{
				let iRec = this.eventData[i];
				if (iRec.Id.includes("1")) {
					let iLoc = iRec.CimetrixGEM300Simulation_MaterialManager_SubstLocID;
					let newRec = {...this.newVizRec};
					newRec.startTime = iRec.CumulTime;
					newRec.locIndex = this.locList.indexOf(iLoc);
					newRec.materialID = iRec.CimetrixGEM300Simulation_MaterialManager_SubstLocSubstID;
					console.log("newRec =", newRec, iLoc);
					for (let j = 1; j + i < this.numEventRecs; j++) {
						let jRec = this.eventData[i + j];
						let jLoc = jRec.CimetrixGEM300Simulation_MaterialManager_SubstLocID;
						if (iLoc == jLoc) {
							newRec.endTime = jRec.CumulTime;
							console.log("newRec =", newRec, iLoc);
							if (newRec.endTime > newRec.startTime) {
								this.materialLocData.push(newRec);
								this.locUtilTimeList[newRec.locIndex] += newRec.endTime - newRec.startTime;
								if (this.maxEndTime < newRec.endTime) {this.maxEndTime = newRec.endTime};
							}
							break;
						}
					}
				}
			}
			
		}
		console.log("Location total utilization times = ", this.locUtilTimeList, 
					this.maxEndTime);
		console.log("Material location data = ", this.materialLocData.length,
												this.materialLocData);
		window.nodeSeqData = [{...this.materialLocData}];
		console.log("Saved data for parallel coord chart ", window.nodeSeqData);
		
    }

    drawNodeBarChart() {
		
		console.log("Entering drawNodeBarChart...");
		
		function createSVGElement(tag) {
		return document.createElementNS('http://www.w3.org/2000/svg', tag)}
		
		this.maxTime = this.maxEndTime * 1.1;
		
		var xTime = d3.scaleLinear()
			.domain([0, this.maxTime])
			.range([0, this.chartWidth]);
			
		var xAxis = d3.axisBottom(xTime);
		
		var yPos = d3.scaleLinear()
			.domain([0,3])
			.range([30,this.chartHeight - 150]);
			
		var yAxis = d3.axisLeft(yPos)
			
		d3.select('#vizTitle')
		  .selectAll('*').remove();

		var nodeTimingTitle = d3.select("#vizTitle")
						.append("g")
						.selectAll("text")
						.data(["Equipment Node Utilization Chart"])
						.enter()
						.append("text")
						.attr('width', this.svgWidth)
						.attr('height', this.titleHeight)
						.attr('y',50)
						.attr('x',400)
						.style('font-weight', 500)
						.style('font-size', "25px")
						.text((d) => d);
							
		console.log("After title in drawNodeBarChart");
		
		d3.select('#nodetiming-div')
		  .selectAll('*').remove();
		
		let svg = createSVGElement("svg");
		
		d3.select("#nodetiming-div")
			.append('svg')
			.attr('height', this.xAxisHeight)
			.attr('width', this.xAxisWidth)
			.attr('id', 'timeAxis')	
			.attr('transform', 'translate(230,700)')
			.call(xAxis);	
			
//
// Draw substrate visit duration bars
//

		d3.select('#nodetiming-div')
			.append('svg')
			.attr('id', 'timingBars')
			.attr('width', this.chartWidth)
			.attr('height', this.chartHeight)
			.attr('transform', 'translate(230,80)')
			.selectAll('rect')
			.data(this.materialLocData)
			.enter()
			.append('rect')
//			.each((d,i) => console.log("Material duration bars: i, d = ", i, d))
			.attr('id', (d,i) => d.materialID)
			.transition()
			.duration(750)
			.attr('x', (d,i) => xTime(d.startTime))
			.attr('y', (d,i) => yPos(d.locIndex)+ (i%8)*5)
			.attr('width', (d,i) => xTime(d.endTime - d.startTime))
			.attr('height', this.vizHeight)
			.style('stroke-width', 1)
			.style('stroke', 'black')
			.style('fill', (d) => this.colorScale[+d.materialID.slice(-2)%5]);
			
//			.on("mouseover", function (d, i) {
//				d3.select(this).transition()
//				  .duration("400")
//				  .style("fill", "rgb(238,75,43)");
//				})
//   		.on("mouseout", function (d, i) {
//     			d3.select(this).transition()
//		          .duration("200")
//				  .style("fill", "rgb(79,175,211)");
//		    }) 

		d3.select('#nodetiming-div')
			.append('svg')
			.attr('id', 'yAxisLabel')
			.attr('width', this.yAxisWidth)
			.attr('height', this.chartHeight)
			.style('position', 'relative')
			.style('left', -555)
			.style('top', 0)
			.attr('transform', 'rotate(-90)')
			.append('text')
			.text('Substrate Location')
			.attr('x', 0)
			.attr('y', 75)
			.style('font-weight', 150)
			.style('font-size', "16px")
			.style('stroke', 'black');

		d3.select('#timeAxis')
			.append('text')
			.text('Processing Time (seconds)')
			.attr('x', this.chartWidth / 2)
			.attr('y', 45)
			.style('font-weight', 100)
			.style('font-size', "15px")
			.style('stroke', 'black');
					
		d3.select("#timingBars")
			.append('line')
			.attr('x1', 0)
			.attr('x2', 0)
			.attr('y1', 0)
			.attr('y2', this.chartHeight+40)
			.style('stroke', 'gray');
			
		d3.select("#timingBars")
			.selectAll('text')
			.data(this.locList)
			.enter()
			.append('text')
			.each((d,i) => console.log("Loc label ", i, d))
			.attr('x', 8)
			.attr('y', (d,i) => yPos(i)-5)
			.text((d) => d )
			.style('stroke', 'black')
			.style('fill', 'black');
			
		var timingAreaD3 = d3.select("#timingBars");
			
		window.toolTip = d3.select("#tipNode")
				.style("position", "absolute")
				.style("visibility", "visible")
				.attr("class", "tooltip")
				.style('padding-left', '10px')
				.style('padding-right', '10px')
				.style("border", "1px solid #969696")
				.style('text-align','center')
				.style('font-weight', 700)
				.style('background','white')
				.style('fill', 'black')
				.style('opacity',1)
				.text("");
				
		timingAreaD3.on('mouseover', function (d) {showSubstrateId(d)})
					.on('mouseout', function() {return toolTip
									.style('opacity',1)
									.style('visibility','visible');});
			
		function showSubstrateId (d) {
			if (d.target.id == "timingBars" || d.target.id == "") {return;};
//			console.log ("Entering showSubstrateId...");
//			console.log(d.clientX, d.clientY, d.pageX, d.pageY, d.target.id);
			return toolTip.style('visibility','visible')
					.style('top', (d.pageY-220)+'px')
					.style('left',(d.pageX-10)+'px')
					.text(d.target.id)
		}
		
		return;
		   				   				
		function comp(a,b,ascend) {
			if (a > b) return ascend ? 1 : -1;
			if (a < b) return ascend ? -1 : 1;
			return 0;
		}

							
    }

			
}
