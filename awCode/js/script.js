
eventData = d3.csv('./EventData/eventData.csv');

Promise.all([eventData]).then( data =>
    {
        let rawEventData = data[0];
		
		console.log("Event data = ", rawEventData);
		window.viewSequence = false;

		let matlSeq = new MaterialSequence(rawEventData);
		console.log("matlSeq = ", matlSeq);
        let recipeSeq = new RecipeSequence(rawEventData);
		console.log("recipeSeq = ", recipeSeq);
        matlSeq.drawChart();
		recipeSeq.drawChart();
    });