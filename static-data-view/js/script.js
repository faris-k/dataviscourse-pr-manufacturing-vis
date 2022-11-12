/**
 * App Entry Point.
 */

const global_app_state = {
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
  global_app_state.data = data;
  const tree = new Tree(d3.select('#tree-container'), global_app_state);
  const table = new Table(d3.select('#table-container'), global_app_state);
  tree.render();
  table.render();
});
