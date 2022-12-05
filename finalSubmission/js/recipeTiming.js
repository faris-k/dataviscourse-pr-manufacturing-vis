/** Class implementing the Bar Chart for Recipe Execution Timing. */
class RecipeTiming {
//
//   Creates a Recipe Execution Bar Chart for Manufacturing Equipment Project
//     
    constructor(eventData) {
		console.log("Entering recipeTiming...");
        this.eventData = eventData;
		
		this.svgWidth = 1100;
		this.chartWidth = 1100;
		this.svgHeight = 1400;
		this.chartHeight = 600;
		this.xAxisHeight = 50;
		this.xAxisWidth = this.chartWidth;
		this.yAxisWidth = 150;
		this.yAxisHeight = this.chartHeight;
        this.vizHeight = 6;
				
		this.colorScale = d3.schemeCategory10;
		this.margins = { top: 50, left: 20, right: 20, bottom: 50 }
		
		this.maxTime = Math.max(...this.eventData.map(o => o.CumulTime));
		console.log("maxTime = ", this.maxTime);
		this.maxEndTime = 0;
		this.timeZero = 0;
		this.startRec = 1000;
		
		this.locList = [];
		this.locUtilTimeList = [];
		this.matlList = [];
		this.vizEventList = [];
		this.newVizRec = {startTime:0, endTime:0, offset:0, locIndex: -1, materialID: "", 
			substrateNum: "", stepCount: 0};
		this.materialRecipeData = [];
		this.numSubstrates = 0;
		this.numSubstratesLimit = 25;
		this.maxEndTime = 0;
		this.timeShift = 50;
		this.substrateList = [];
		for (let iSub = 1; iSub <= this.numSubstratesLimit; iSub ++){
			this.substrateList.push(iSub.toString());};
		this.alignLeft = false;
		this.alignScaleFactor = 10;
		this.stepVariationFactor = 0;  //vary recipe step duration by +/- 2.5%
		this.stepScaleFactors = [.5,.7,1.0,1.5,1.4,2.0,.8,.5,.2,.2];

		
//
//  Include only Carrier2 substrates in a complete lot
//
		this.numEventRecs = this.eventData.length;
		console.log("numEventRecs = ", this.numEventRecs);
		for (let i = 0; i < this.numEventRecs; i++) {
			let loc = this.eventData[i].CimetrixGEM300Simulation_ModuleID;
			if  (! this.locList.includes(loc)) {
				this.locList.push(loc);
				this.locUtilTimeList.push(0);
			}
			let matl = this.eventData[i].CimetrixGEM300Simulation_SubstrateID;
			if (! this.matlList.includes(matl) && matl != "" && matl.slice(0,8) != "CARRIER1") {
				this.matlList.push(matl);
			}
		}
		console.log ("Substrate location list =  ", this.locList.length, this.locList);
		console.log("Material list = ", this.matlList.length, this.matlList);	
//
//  Generate substrate recipe execution record list 
//		
		for (let i = this.startRec; i < this.numEventRecs; i++) {
//			console.log("In recipe tming: i, eventData[i] = ", i, this.eventData[i]);
			if (this.eventData[i].CimetrixGEM300Simulation_SubstrateID == "CARRIER2.01")   
			{
				console.log("In RecipeTiming: Found beginning of lot... at event record ", i);
				this.startLotRec = i;
				this.timeZero = this.eventData[i].CumulTime - this.timeShift;;
				console.log("timeZero = ", this.timeZero);
				break;
			}
		}
		for (let i = this.startLotRec; i < this.numEventRecs; i++) {
			let iRec = this.eventData[i];
//			console.log ("***** i, iRec = ", i, iRec);
			if (this.matlList.includes(iRec.CimetrixGEM300Simulation_SubstrateID) &&
				iRec.Id.includes("5") && iRec.CimetrixGEM300Simulation_StepCount == "1"
				&& this.numSubstrates < this.numSubstratesLimit) {
					console.log("In recipe timing: starting a new set of recipe step records at ",i, iRec);
					this.numRecipeSteps = 0;
					let iMatl = iRec.CimetrixGEM300Simulation_SubstrateID;
					for (let j = 0; j < this.numEventRecs; j++) {
						let jRec = this.eventData[i+j];
						console.log("in recipe timing: j, jRec = ", j, jRec);
						if (jRec.Id.includes("5") && jRec.CimetrixGEM300Simulation_SubstrateID == iMatl){
							let jMatl = jRec.CimetrixGEM300Simulation_SubstrateID;
							let jSubstrate = jMatl.slice(-2);
							let jLoc = jRec.CimetrixGEM300Simulation_ModuleID;
							let newRec = {...this.newVizRec};
							newRec.startTime = (jRec.CumulTime - this.timeZero); // +  
//								 (4 * (Math.random() - .5) * this.stepVariationFactor);;
							newRec.stepCount = jRec.CimetrixGEM300Simulation_StepCount;
							newRec.locIndex = this.locList.indexOf(jLoc);
							newRec.materialID = jMatl;
							newRec.substrateNum = jSubstrate;
							console.log("In recipeTiming: newRec = ", newRec);
							this.numRecipeSteps += 1;
							this.materialRecipeData.push(newRec);
							if (newRec.stepCount == "10") {
								this.numSubstrates += 1;
								this.lastEndTime = jRec.CumulTime - this.timeZero + 3;
								this.maxEndTime = Math.max(this.lastEndTime, this.maxEndTime);
								this.lastRecIndex = this.materialRecipeData.length;
								this.firstRecIndex = this.lastRecIndex - this.numRecipeSteps;
								this.firstStartTime = this.materialRecipeData[this.firstRecIndex].startTime;
								console.log("numSubstrates, lastRecIndex, recipeData =", this.numSubstrates, this.lastRecIndex, this.materialRecipeData);
								for (let k = 0; k < this.numRecipeSteps; k++) {
									console.log("K =", k);
									this.materialRecipeData[this.lastRecIndex - k - 1].endTime = this.lastEndTime ;
									this.materialRecipeData[this.lastRecIndex - k - 1].offset = this.lastEndTime - this.firstStartTime;
									this.lastEndTime = this.materialRecipeData[this.lastRecIndex - k - 1].startTime ;
								};
							break;
							};
						};
					};
			};
		};
		console.log("Number if substrates = ", this.numSubstrates);
		console.log("Material recipe execution data = ", this.materialRecipeData.length,
												this.materialRecipeData);


		 this.chk = document.createElement('input');
         this.lbl = document.createElement('label');
         this.chk.setAttribute('type', 'checkbox');
		 console.log("1 - Setting checkbox attribute ", this.alignLeft);
//		 this.chk.setAttribute('checked', this.alignLeft);
         this.chk.setAttribute('id', 'chkAlignLeft');
		 this.chk.setAttribute('margin-right', 20);
         this.lbl.setAttribute('for', 'chkAlignLeft');
         this.lbl.appendChild(document.createTextNode('Align Wafer Start Times'));
		 this.container = document.getElementById("nodetiming-div");
		 this.chk.setAttribute('transform', 'translate(230,50)');
		 this.container.appendChild(this.chk);
		 this.container.appendChild(this.lbl);
		 this.chk.checked = this.alignLeft;
		 this.chk.addEventListener('click', (event) => {
			 console.log("Clicked alignment checkbox in state ", this.alignLeft);
			 this.align.Left = ! this.alignLeft;
			 this.chk.checked = this.alignLeft;
		 });
    }


    drawRecipeBarChart() {
		
		console.log("Entering drawRecipeBarChart...");
		
		function createSVGElement(tag) {
		return document.createElementNS('http://www.w3.org/2000/svg', tag)}
		
		this.maxTime = this.maxEndTime * 1.2;
		
		var xTime = d3.scaleLinear()
			.domain([0, this.maxTime])
			.range([0, this.chartWidth]);
			
		var xAxis = d3.axisBottom(xTime);
		
		var xAlignTime = d3.scaleLinear()
			.domain([0,this.maxtime / this.alignScaleFactor])
			.range([0, this.chartWidth]);
			
		var xAlignAxis = d3.axisBottom(xAlignTime);
		
		var yPos = d3.scaleLinear()
			.domain([1,25])
			.range([30,this.chartHeight-50]);
			
		var yAxis = d3.axisLeft(yPos)

		d3.select('#vizTitle')
		  .selectAll('*').remove();
		
		var recipeTimingTitle = d3.select("#vizTitle")
						.append("g")
						.selectAll("text")
						.data(["Recipe Step Execution Timing Chart"])
						.enter()
						.append("text")
						.attr('width', this.svgWidth)
						.attr('height', this.titleHeight)
						.attr('y',50)
						.attr('x',400)
						.style('font-weight', 500)
						.style('font-size', "25px")
						.text((d) => d);
							
		console.log("After title in drawRecipeBarChart");
		
		d3.select('#nodetiming-div')
		  .selectAll('*')
		  .remove();
		  
		d3.select('#tipNode')
			.style('opacity',0);
//			.attr('visibility','hidden');
		  
		 this.chk = document.createElement('input');
         this.lbl = document.createElement('label');
         this.chk.setAttribute('type', 'checkbox');
		 console.log("2 - Setting checkbox attribute ", this.alignLeft);
         this.chk.setAttribute('id', 'chkAlignLeft');
		 this.chk.setAttribute('style','position:relative; left:200px; top:50px;');
         this.lbl.setAttribute('for', 'chkAlignLeft');
		 this.lbl.setAttribute('style','position:relative; left:200px; top:50px;');
         this.lbl.appendChild(document.createTextNode('Align Wafer Start Times'));
		 this.container = document.getElementById("nodetiming-div");
		 this.container.appendChild(this.chk);
		 this.container.appendChild(this.lbl);
		 this.chk.checked = this.alignLeft;
		 this.chk.addEventListener('click', (event) => {
			 console.log("Clicked alignment checkbox in state ", this.alignLeft);
			 this.alignLeft = ! this.alignLeft;
			 this.chk.checked = this.alignLeft;
			 console.log("chkbox = ", this.chk);
			 this.drawRecipeBarChart();
		 });

		
		let svg = createSVGElement("svg");
		
		d3.select("#nodetiming-div")
			.append('svg')
			.attr('height', this.xAxisHeight)
			.attr('width', this.xAxisWidth)
			.attr('id', 'timeAxis')	
			.attr('transform', 'translate(22,730)')
			.call(this.alignLeft ? xAlignAxis : xAxis);	
             			
		d3.select('#nodetiming-div')
			.append('svg')
			.attr('id', 'timingBars')
			.attr('width', this.chartWidth)
			.attr('height', this.chartHeight)
			.attr('transform', 'translate(200,80)')
			.selectAll('rect')
			.data(this.materialRecipeData)
			.enter()
			.append('rect')
//			.each((d,i) => console.log("Material duration bars: i, d = ", i, d))
			.attr('id', (d,i) => d.materialID)
			.transition()
			.duration(750)
			.attr('x', (d,i) => this.alignLeft ? xTime(d.offset) * this.alignScaleFactor :
								xTime(d.startTime))
			.attr('y', (d,i) => yPos(d.substrateNum)) // + (i%8)*5)
			.attr('width', (d,i) => this.alignLeft ? xTime(d.endTime - d.startTime) * this.alignScaleFactor : 
								xTime(d.endTime - d.startTime))
			.attr('height', this.vizHeight)
			.style('stroke-width', 1)
//			.style('stroke', 'black')
			.style('fill', (d) => this.colorScale[+d.stepCount]);
			
		d3.select('#nodetiming-div')
			.append('svg')
			.attr('id', 'yAxisLabel')
			.attr('width', this.yAxisWidth)
			.attr('height', this.chartHeight)
			.style('position', 'relative')
			.style('left', -775)
			.style('top', 0)
			.attr('transform', 'rotate(-90)')
			.append('text')
			.text('Substrate Number')
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
			.data(this.substrateList)
			.enter()
			.append('text')
//			.each((d,i) => console.log("Loc label ", i, d))
			.attr('x', 5)
			.attr('y', (d,i) => yPos(i)+30)
			.text((d) => d )
			.style('fill', 'black');
	
		return;
		   				   	
	
		function comp(a,b,ascend) {
			if (a > b) return ascend ? 1 : -1;
			if (a < b) return ascend ? -1 : 1;
			return 0;
		}
			
	}
}