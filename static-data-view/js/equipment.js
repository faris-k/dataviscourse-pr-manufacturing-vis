class Equipment {
  constructor(name, type, parent_name, n_states, n_events, n_attributes, n_parameters, n_exceptions, n_state_machines) {
    this.name = name;
    this.type = type;
    this.n_states = n_states;
    this.n_events = n_events;
    this.n_attributes = n_attributes;
    this.n_parameters = n_parameters;
    this.n_exceptions = n_exceptions;
    this.n_state_machines = n_state_machines;
    this.parent_name = parent_name;
    this.parent_node = null;
    this.children = [];
  }
}
