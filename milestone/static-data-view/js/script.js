/**
 * App Entry Point.
 */

const globalAppState = {
  data: [],
  tree: null,
  table: null,
  force: null
};

async function load_json() {
  const data = await d3.json('../data/data.json');
  return data;
}

load_json().then((data) => {
  globalAppState.data = data;
  const tree = new Tree(d3.select('#tree-container'), globalAppState);
  const table = new Table(d3.select('#table-container'), globalAppState);
  tree.render();
  table.render();
});
