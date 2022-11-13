class Node {
  constructor(name, type, parentName, nStates, nEvents, nAttributes, nParameters, nExceptions, nStateMachines) {
    this.name = name;
    this.type = type;
    this.nStates = nStates;
    this.nEvents = nEvents;
    this.nAttributes = nAttributes;
    this.nParameters = nParameters;
    this.nExceptions = nExceptions;
    this.nStateMachines = nStateMachines;
    this.parentName = parentName;
    this.parentNode = null;
    this.children = [];
  }
}
