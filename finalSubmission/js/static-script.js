/**
 * App Entry Point.
 */
const globalAppState = {
	data: [],
	theme: [],
};

async function loadData() {
	const data = await d3.json("./StaticData/data.json");
	return data;
}

const parseData = (data) => {
	return data.map(
		(node) =>
			new Node(
				node.name,
				node.type,
				node.parent,
				node.nStates,
				node.nEvents,
				node.nAttributes,
				node.nParameters,
				node.nExceptions,
				node.nStateMachines
			)
	);
};

const colorScheme = () => ({
	normal: [
		"#FFAAD3",
		"#FF9D7A",
		"#FFDE69",
		"#A4E8A3",
		"#8AE6FB",
		"#E2D4FF",
		"#FFF5D2",
	],
	bright: [
		"#760039",
		"#5B0505",
		"#594600",
		"#004012",
		"#00303A",
		"#400356",
		"#594600",
	],
});

const initStaticDataViewer = (container) => {
	loadData().then((data) => {
		globalAppState.data = parseData(data);
		globalAppState.theme = colorScheme();

		let mainContainer = container
			.append("div")
			.attr("id", "grid-container-filemon")
			.attr("class", "container");

		let treeContainer = mainContainer
			.append("div")
			.attr("class", "row")
			.append("div")
			.attr("class", "col-xxl-12")
			.attr("id", "tree-container");

		let tableContainer = mainContainer
			.append("div")
			.classed("row", true)
			.append("div")
			.attr("class", "col-xxl-12")
			.attr("id", "table-container");

		const tree = new Tree(treeContainer, globalAppState);
		const table = new Table(tableContainer, globalAppState);

		tree.render();
		table.render();
	});
};
