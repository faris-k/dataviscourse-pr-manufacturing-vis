class Node {
  constructor(name, type, parentName, nStates, nEvents, nAttributes, nParameters, nExceptions, nStateMachines) {
    this.name = name;
    this.type = type;
    this.utilization = 2 * parseInt(nStates) + 5 * parseInt(nEvents) + 2 * parseInt(nAttributes) + 2 * parseInt(nParameters) + parseInt(nExceptions) + 10 * parseInt(nStateMachines);
    this.parentName = parentName;
    this.parentNode = null;
    this.children = [];
  }
}
